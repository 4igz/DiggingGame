//!optimize 2
//!native
import { Service, OnStart, OnTick } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { CollectionService, HttpService, PhysicsService, Players, ServerStorage, Workspace } from "@rbxts/services";
import { Events, Functions } from "server/network";
import { mapConfig } from "shared/config/mapConfig";
import { boatConfig } from "shared/config/boatConfig";
import { gameConstants } from "shared/gameConstants";
import { interval } from "shared/util/interval";
import { ProfileService } from "../backend/profileService";
import { ZoneService } from "../backend/zoneService";

@Service({})
export class BoatService implements OnStart, OnTick {
	private boatSpawns = new Map<keyof typeof mapConfig, Array<PVInstance>>();
	private spawnedBoats = new Map<string, Model>();
	private boatOwners = new Map<string, Player>();
	private boatModelFolder = ServerStorage.WaitForChild("BoatModels");
	private lastActiveBoatTimes = new Map<string, number>();
	private activeBoats = new Set<string>();

	private BOAT_DESPAWN_TIMER = 60;

	constructor(private readonly profileService: ProfileService, private readonly zoneService: ZoneService) {}

	onStart() {
		const boatSpawnCooldown = interval(1);

		PhysicsService.RegisterCollisionGroup(gameConstants.BOAT_COLGROUP);
		PhysicsService.CollisionGroupSetCollidable(gameConstants.BOAT_COLGROUP, gameConstants.BOAT_COLGROUP, false); // Boats can't collide with another.
		PhysicsService.RegisterCollisionGroup(gameConstants.BOAT_COLLIDER_COLGROUP);
		PhysicsService.CollisionGroupSetCollidable(gameConstants.BOAT_COLGROUP, gameConstants.BOAT_COLGROUP, true); // Boats can't collide with another.
		PhysicsService.CollisionGroupSetCollidable(
			gameConstants.PLAYER_COLGROUP,
			gameConstants.BOAT_COLLIDER_COLGROUP,
			false,
		); // Boats can't collide with another.

		Workspace.Terrain.CollisionGroup = gameConstants.BOAT_COLGROUP; // Terrain can't collide with boats

		Players.PlayerRemoving.Connect((player) => {
			const result = Object.entries(this.boatOwners).find(([_, p]) => p === player);
			if (result) {
				const [boatId] = result;
				const boat = this.spawnedBoats.get(boatId);
				if (boat) {
					this.spawnedBoats.delete(boatId);
					this.boatOwners.delete(boatId);
					this.lastActiveBoatTimes.delete(boatId);
					boat.Destroy();
				}
			}
		});

		// Initialize boat spawns
		for (const mapName of Object.keys(mapConfig)) {
			const map = CollectionService.GetTagged("Map").filter((instance) => instance.Name === mapName)[0];
			if (!map) {
				warn(`Couldn't find map for Map: ${mapName} when trying to create boat spawns.`);
				continue;
			}
			const boatSpawnFolder = map.FindFirstChild("BoatSpawns");
			if (!boatSpawnFolder) {
				warn(`Couldn't find BoatSpawns folder for Map: ${mapName}`);
				continue;
			}
			const boatSpawns = boatSpawnFolder.GetChildren().filter((child) => child.IsA("PVInstance"));
			this.boatSpawns.set(mapName, boatSpawns);
		}

		// Ensure boats are welded and unanchored.
		for (const boatModel of this.boatModelFolder.GetChildren()) {
			if (!boatModel.IsA("Model")) {
				warn(
					`Unknown instance in ${this.boatModelFolder.GetFullName()} folder or boat model ${
						boatModel.Name
					} is not a model.`,
				);
				continue;
			}
			const primaryPart = boatModel.PrimaryPart;
			if (!primaryPart) {
				warn(`Boat model ${boatModel.Name} doesn't have a primary part, and it is required.`);
				continue;
			}

			for (const descendant of boatModel.GetDescendants()) {
				if (descendant === primaryPart) continue;
				if (descendant.IsA("BasePart")) {
					const weld = new Instance("WeldConstraint");
					weld.Parent = primaryPart; // Ensure entire boat is welded to primary part
					weld.Part0 = primaryPart;
					weld.Part1 = descendant;
					descendant.Anchored = false; // Ensure the boat is not anchored

					if (descendant.Name !== "Physics") {
						descendant.CollisionGroup = gameConstants.BOAT_COLGROUP;
						descendant.Massless = true;
					}
				}
			}
		}

		Functions.getOwnsBoat.setCallback((player, boatId) => {
			return this.boatOwners.get(boatId) === player;
		});

		Events.spawnBoat.connect((player, boatName) => {
			if (!boatSpawnCooldown(player.UserId)) {
				Events.boatSpawnResponse(player, false, `Spawning too quickly!`);
				return;
			}

			const profile = this.profileService.getProfile(player);
			if (!profile) {
				return;
			}
			if (!boatConfig[boatName]) {
				Events.boatSpawnResponse(player, false, `Found no boat named ${boatName}!`);
				error(`Invalid boat name: ${boatName}`);
			}

			// Check for an existing boat and remove it
			const result = Object.entries(this.boatOwners).find(([_, p]) => p === player);
			if (result) {
				const [boatId] = result;
				const boat = this.spawnedBoats.get(boatId);
				// Player already has this boat spawned.
				if (boat && boat.Name === boatName) {
					Events.boatSpawnResponse(player, false, `You already have this boat spawned!`);
					return;
				}
				// Player has a different boat spawned.
				if (boat) {
					this.spawnedBoats.delete(boatId);
					this.boatOwners.delete(boatId);
					this.lastActiveBoatTimes.delete(boatId);
					this.activeBoats.delete(boatId);
					boat.Destroy();
				}
			}

			const boatModel = this.boatModelFolder.FindFirstChild(boatName);
			if (!boatModel) {
				Events.boatSpawnResponse(player, false, `No boat model named ${boatName}!`);
				error(`Couldn't find boat model for boat: ${boatName}`);
			}

			if (profile.Data.ownedBoats.get(boatName) === false) {
				Events.boatSpawnResponse(player, false, `You don't own this boat!`);
				return;
			}
			const currentMap = profile.Data.currentMap;

			const unoccupiedBoatSpawn = this.getUnoccupiedBoatSpawn(player, currentMap);
			if (!unoccupiedBoatSpawn) {
				Events.boatSpawnResponse(player, false, `All spawns full!`);
				warn(`Couldn't find unoccupied boat spawn for map: ${currentMap}`);
				return;
			}

			const boatId = HttpService.GenerateGUID();
			this.boatOwners.set(boatId, player);

			const boat = boatModel.Clone() as Model;
			boat.SetAttribute("boatId", boatId);
			boat.PivotTo(unoccupiedBoatSpawn?.GetPivot().add(new Vector3(0, boat.GetExtentsSize().Y / 2, 0)));
			boat.Parent = Workspace;
			this.spawnedBoats.set(boatId, boat);
			this.lastActiveBoatTimes.set(boatId, tick());
			Events.boatSpawnResponse(player, true, boatName);

			for (const descendant of boat.GetDescendants()) {
				if (descendant.IsA("BasePart")) {
					descendant.SetNetworkOwner(player);
				}
			}

			// For example if the boat fell out of the world, we need to do despawning logic
			boat.AncestryChanged.Once(() => {
				if (this.spawnedBoats.has(boatId) === true) {
					this.spawnedBoats.delete(boatId);
					this.boatOwners.delete(boatId);
					this.lastActiveBoatTimes.delete(boatId);
					this.activeBoats.delete(boatId);
					boat.Destroy();
				}
			});
		});

		Functions.sitInBoat.setCallback((player, boatId) => {
			const boat = this.spawnedBoats.get(boatId);
			if (!boat) return error(`Boat ${boatId} doesn't exist`);

			const character = player.Character;
			if (!character) return error("Player doesn't have a character");

			const humanoid = character.WaitForChild("Humanoid", 1) as Humanoid;
			if (!humanoid) return error("Player doesn't have a humanoid");

			const hrp = character.PrimaryPart as BasePart;
			if (!hrp) return error("Player doesn't have a primary part");

			const ownerSeat = boat.FindFirstChild("OwnerSeat") as Part;
			if (!ownerSeat) return error(`Boat ${boat.Name} doesn't have an owner seat`);

			const weld = ownerSeat.FindFirstChildOfClass("WeldConstraint") as WeldConstraint;
			if (!weld) return error(`Owner seat for boat ${boat.Name} doesn't have a weld constraint`);

			character.PivotTo(ownerSeat.CFrame.add(ownerSeat.ExtentsSize.mul(Vector3.yAxis.div(2))));
			weld.Part1 = hrp;
			this.lastActiveBoatTimes.set(boatId, tick());
			this.activeBoats.add(boatId);

			return true;
		});

		Events.exitBoat.connect((player, boatId) => {
			const boat = this.spawnedBoats.get(boatId);
			if (!boat) return;

			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			const character = player.Character;
			if (!character) return;

			const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
			if (!humanoid) return;

			const hrp = character.PrimaryPart as Part;
			if (!hrp) return;

			const ownerSeat = boat.FindFirstChild("OwnerSeat") as Part;
			if (!ownerSeat) return;

			const weld = ownerSeat.FindFirstChildOfClass("WeldConstraint") as WeldConstraint;
			if (!weld) return;

			// Client removes the weld, but the server validates that.
			weld.Part1 = undefined;
			this.lastActiveBoatTimes.set(boatId, tick());
			this.activeBoats.delete(boatId);
		});
	}

	onTick() {
		for (const boatId of this.activeBoats) {
			this.lastActiveBoatTimes.set(boatId, tick());
		}

		for (const [boatId, lastActiveTime] of this.lastActiveBoatTimes) {
			if (tick() - lastActiveTime > this.BOAT_DESPAWN_TIMER) {
				const boat = this.spawnedBoats.get(boatId);
				const boatOwner = this.boatOwners.get(boatId);
				if (boat && boatOwner && boatOwner.Parent === Players && !this.zoneService.isPlayerAtSeas(boatOwner)) {
					this.spawnedBoats.delete(boatId);
					this.boatOwners.delete(boatId);
					this.lastActiveBoatTimes.delete(boatId);
					this.activeBoats.delete(boatId);
					boat.Destroy();
				}
			}
		}
	}

	getUnoccupiedBoatSpawn(player: Player, mapName: keyof typeof mapConfig): PVInstance | undefined {
		const boatSpawns = this.boatSpawns.get(mapName);
		if (!boatSpawns) {
			warn(`Couldn't find boat spawns for map: ${mapName}`);
			return;
		}

		const playerPos = player.Character?.GetPivot().Position;
		if (!playerPos) return;

		// Only need special logic if there are boats already spawned
		if (this.spawnedBoats.size() > 0) {
			let closestSpawn: PVInstance | undefined;
			let minDistance = math.huge;

			for (const spawn of boatSpawns) {
				const spawnPos = spawn.GetPivot().Position;
				let occupied = false;

				// Check if this spawn is occupied by any existing boat
				for (const [, boat] of this.spawnedBoats) {
					const boatPos = boat.GetPivot().Position;
					const boatSize = boat.GetExtentsSize();

					if (
						math.abs(boatPos.X - spawnPos.X) < boatSize.X / 2 &&
						math.abs(boatPos.Z - spawnPos.Z) < boatSize.Z / 2
					) {
						occupied = true;
						break;
					}
				}

				// If spawn isn't occupied, see if it’s closer than our current best
				if (!occupied) {
					const distance = spawnPos.sub(playerPos).Magnitude;
					if (distance < minDistance) {
						minDistance = distance;
						closestSpawn = spawn;
					}
				}
			}

			// Return the best candidate after checking all spawns
			return closestSpawn;
		} else {
			// If no boats are spawned, just pick the closest spawn
			let closestSpawn: PVInstance | undefined;
			let closestDistance = math.huge;

			for (const spawn of boatSpawns) {
				const distance = spawn.GetPivot().Position.sub(playerPos).Magnitude;
				if (distance < closestDistance) {
					closestDistance = distance;
					closestSpawn = spawn;
				}
			}

			return closestSpawn;
		}
	}
}
