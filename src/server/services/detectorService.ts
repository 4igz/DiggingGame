import { Service, OnStart, OnTick } from "@flamework/core";
import { CollectionService, Players, ServerStorage, Workspace } from "@rbxts/services";
import { TargetService } from "./targetService";
import { BASE_DETECTOR_STRENGTH, metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { gameConstants } from "shared/constants";
import { Events } from "server/network";
import { Target } from "shared/networkTypes";
import { ProfileService } from "./profileService";

@Service({})
export class DetectorService implements OnStart, OnTick {
	private lastVisualizationTimes: Map<Player, number> = new Map();
	private lastPlayerPositions: Map<Player, Vector3> = new Map();
	private luckRolls: Map<number, number> = new Map();
	private rolling: Map<number, { start: number; current: number }> = new Map();
	private readonly VISUALIZATION_RATE = 1; // seconds
	private startRollingTime = Workspace.GetServerTimeNow();

	constructor(private readonly targetService: TargetService, private readonly profileService: ProfileService) {}

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

		Events.endDetectorLuckRoll.connect((player) => {
			this.rolling.delete(player.UserId);

			// Spawn target.
			const existingTarget = this.targetService.getPlayerTarget(player);
			if (existingTarget) return;

			this.targetService.spawnTarget(player, this.luckRolls.get(player.UserId) ?? 0.5);
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
		Events.beginDigging(player, target, { strength: profile.Data.strength, shovel: profile.Data.equippedShovel });
		target.activelyDigging = true;

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
			const elapsedTime = Workspace.GetServerTimeNow() - time.start; // Elapsed time
			const frequencyScale = 0.75; // Frequency adjustment for oscillation
			const sineValue = math.sin(elapsedTime * math.pi * frequencyScale);
			const MAGNET_AT = 0.9;

			// Adjust for exponential shape and amplitude
			let adjustedValue = math.sign(sineValue) * (1 - math.pow(1 - math.abs(sineValue), 0.5));

			// Magnet effect: clamp to 10 if above 0.9
			if (math.abs(adjustedValue) > MAGNET_AT) {
				adjustedValue = 1; // Magnet to top
			}

			// Scale to 0-10 range
			const luckValue = 10 * math.abs(adjustedValue);

			// Update the rolling and luck rolls data
			this.luckRolls.set(userId, luckValue);
			this.rolling.set(userId, { start: time.start, current: time.current + dt });

			// Optionally, update the client periodically
			/*
			if (tick() % this.VISUALIZATION_RATE < dt) {
				const player = Players.GetPlayerByUserId(userId);
				if (player) {
					Events.updateLuckRoll.fire(player, luckValue, time);
				}
			}
			*/
		}

		// Make detectors detect metals and flash when they're nearby
		for (const detector of CollectionService.GetTagged("Detector")) {
			if (!detector || detector.Parent === undefined) continue;
			assert(detector.IsA("Tool"), "Detector must be a tool");

			const detectorConfig = metalDetectorConfig[detector.Name];
			assert(detectorConfig, "Detector config not found");

			const character = detector.Parent as Model | undefined;
			if (!character) continue;
			const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
			if (!humanoid) continue;
			const player = Players.GetPlayerFromCharacter(character);
			if (!player) continue;

			// Default state
			let nearbyTarget = false;
			let digTarget = this.targetService.getPlayerTarget(player);
			let withinDigRange = false;

			if (!digTarget) continue;

			const distance = character.PrimaryPart?.Position.sub(digTarget.position).Magnitude;

			if (distance === undefined) continue;

			if (distance < gameConstants.DIG_RANGE) {
				// Within DIG_RANGE, set state to fully on and beeping
				withinDigRange = true;
			} else if (distance < detectorConfig.searchRadius) {
				nearbyTarget = true;
			}

			if (withinDigRange && digTarget) {
				const isDigging = this.targetService.playerDiggingTargets.has(player);
				if (isDigging) continue;
				this.startDigging(player, digTarget);
			} else if (digTarget) {
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
					Events.createWaypointVisualization(player, digTarget.position, detector.Name, nearbyTarget);
					this.lastVisualizationTimes.set(player, now);
					this.lastPlayerPositions.set(player, playerPosition);
				}
			}
		}
	}
}
