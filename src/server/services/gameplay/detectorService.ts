//!optimize 2
//!native
import { Service, OnStart, OnTick } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { TargetService } from "./targetService";
import { gameConstants } from "shared/gameConstants";
import { Events } from "server/network";
import { Target } from "shared/networkTypes";
import { ProfileService } from "../backend/profileService";
import { GamepassService } from "../backend/gamepassService";
import { Signals } from "shared/signals";
import { computeLuckValue } from "shared/util/detectorUtil";
import Signal from "@rbxts/goodsignal";

@Service({})
export class DetectorService implements OnStart, OnTick {
	private lastVisualizationTimes: Map<Player, number> = new Map();
	private lastPlayerPositions: Map<Player, Vector3> = new Map();
	private luckRolls: Map<number, number> = new Map();
	private rolling: Map<number, { start: number; current: number }> = new Map();
	private readonly VISUALIZATION_RATE = 1; // seconds
	public startedDigging = new Signal<(player: Player, target: Target) => void>();

	constructor(
		private readonly targetService: TargetService,
		private readonly profileService: ProfileService,
		private readonly gamepassService: GamepassService,
	) {}

	onStart() {
		Events.beginDetectorLuckRoll.connect((player) => {
			const existingTarget = this.targetService.getPlayerTarget(player);
			if (existingTarget) return;

			this.luckRolls.set(player.UserId, 0);
			const now = Workspace.GetServerTimeNow() - player.GetNetworkPing();
			this.rolling.set(player.UserId, {
				start: now,
				current: now,
			});
		});

		Events.endDetectorLuckRoll.connect((player, cancelled: boolean = false) => {
			const rollingData = this.rolling.get(player.UserId);
			if (!rollingData) return;

			// Adjust for latency before ending
			const now = Workspace.GetServerTimeNow() - player.GetNetworkPing();
			const elapsedTime = now - rollingData.start;

			// Compute final luck roll based on adjusted time
			const finalLuckValue = computeLuckValue(elapsedTime);

			this.rolling.delete(player.UserId);

			// Spawn target.
			const existingTarget = this.targetService.getPlayerTarget(player);
			if (existingTarget) return;

			const response = !cancelled ? this.targetService.spawnTarget(player, finalLuckValue) : undefined;
			if (!response) {
				Events.targetSpawnFailure.fire(player);
			}
		});

		Events.nextTargetAutoDigger.connect((player) => {
			this.rolling.delete(player.UserId);

			// Spawn target.
			const existingTarget = this.targetService.getPlayerTarget(player);
			if (existingTarget) return;

			const response = this.targetService.spawnTarget(player, 10);
			if (!response) {
				Events.targetSpawnFailure.fire(player);
			}
		});

		Signals.startDigging.Connect((player, target) => {
			this.startDigging(player, target);
		});
	}

	startDigging(player: Player, target: Target) {
		const character = player.Character;
		if (!character) return;
		const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
		if (!humanoid) return;
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		// Cache the target the player is digging so we don't have to search for it again
		this.targetService.playerDiggingTargets.set(player, target);
		// Begin digging automatically
		humanoid.WalkSpeed = 0;

		let strength = profile.Data.strength;
		this.targetService.playerStartedDiggingTimes.set(player, tick() + player.GetNetworkPing());
		Events.beginDigging(
			player,
			{
				itemId: target.itemId,
				name: target.name,
				position: target.position,
				owner: player,
				digProgress: target.digProgress,
				mapName: target.mapName,
				maxProgress: target.maxProgress,
				base: target.base,
			},
			{ strength, shovel: profile.Data.equippedShovel },
		);
		this.startedDigging.Fire(player, target);

		Events.replicateDig.except(player, {
			itemId: target.itemId,
			name: target.name,
			position: target.position,
			digProgress: target.digProgress,
			owner: player,
			mapName: target.mapName,
			maxProgress: target.maxProgress,
			base: target.base,
		});

		// Delay the digging process by the player's ping
		task.delay(player.GetNetworkPing() / 2, () => {
			target.activelyDigging = true;
		});

		// Now equip the shovel for the player also.
		const backpack = player.WaitForChild("Backpack");

		// Remove the metal detector from the player's hands if it's there
		const detector = character.FindFirstChild(profile.Data.equippedDetector) as Tool;
		if (detector) {
			detector.Parent = backpack;
		}

		const shovel = backpack.FindFirstChild(profile.Data.equippedShovel) as Tool;
		if (shovel) {
			shovel.Parent = character;

			// If the shovel changes ancestry while digging, we can end the digging process
			shovel.AncestryChanged.Once(() => {
				// Ensure the player is still digging this target
				if (this.targetService.playerDiggingTargets.get(player) !== target) return;
				if (shovel.Parent !== character) {
					this.targetService.endDigging(player);
				}
			});
		}
	}

	onTick(dt: number) {
		for (const [userId, time] of this.rolling) {
			const elapsedTime = Workspace.GetServerTimeNow() - time.start;
			const luckValue = computeLuckValue(elapsedTime);

			this.luckRolls.set(userId, luckValue);
			this.rolling.set(userId, { start: time.start, current: time.current + dt });
		}

		// Make detectors detect metals and flash when they're nearby
		for (const target of this.targetService.activeTargets) {
			const player = target.owner;
			const character = player.Character as Model | undefined;
			if (!character) continue;
			const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
			if (!humanoid) continue;

			let withinDigRange = false;

			const detectorPosition = character.GetPivot().Position;
			const targetPosition = target.position;
			const horizontalDistance = new Vector3(detectorPosition.X, 0, detectorPosition.Z).sub(
				new Vector3(targetPosition.X, 0, targetPosition.Z),
			).Magnitude;
			const distance = horizontalDistance;

			if (distance === undefined) continue;

			if (distance < gameConstants.DIG_RANGE) {
				// Within DIG_RANGE, set state to fully on and beeping
				withinDigRange = true;
			}

			if (withinDigRange && target) {
				const isDigging = this.targetService.playerDiggingTargets.has(player);
				if (isDigging) continue;
				this.startDigging(player, target);
			} else if (target) {
				const lastVisualizationTime = this.lastVisualizationTimes.get(player) ?? 0;
				const lastPlayerPosition = this.lastPlayerPositions.get(player) ?? new Vector3();
				const playerPosition = player.Character?.PrimaryPart?.Position ?? new Vector3();
				const positionDifference = playerPosition.sub(lastPlayerPosition).Magnitude;

				const RECALCULATE_DISTANCE = 5;

				const now = tick();
				if (
					now - lastVisualizationTime >= this.VISUALIZATION_RATE ||
					positionDifference >= RECALCULATE_DISTANCE
				) {
					this.lastVisualizationTimes.set(player, now);
					this.lastPlayerPositions.set(player, playerPosition);
				}
			}
		}
	}
}
