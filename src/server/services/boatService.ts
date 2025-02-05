import { Service, OnStart } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { HttpService, PhysicsService, Players, ServerStorage, Workspace } from "@rbxts/services";
import { Events, Functions } from "server/network";
import { mapConfig } from "shared/config/mapConfig";
import { ProfileService } from "./profileService";
import { boatConfig } from "shared/config/boatConfig";
import { gameConstants } from "shared/constants";
import { interval } from "shared/util/interval";

@Service({})
export class BoatService implements OnStart {
	private boatSpawns = new Map<keyof typeof mapConfig, Array<PVInstance>>();
	private spawnedBoats = new Map<string, Model>();
	private boatOwners = new Map<string, Player>();
	private boatModelFolder = ServerStorage.WaitForChild("BoatModels");

	constructor(private readonly profileService: ProfileService) {
		PhysicsService.RegisterCollisionGroup(gameConstants.BOAT_COLGROUP);
		PhysicsService.CollisionGroupSetCollidable(gameConstants.BOAT_COLGROUP, gameConstants.BOAT_COLGROUP, false); // Boats can't collide with another.

		Workspace.Terrain.CollisionGroup = gameConstants.BOAT_COLGROUP; // Terrain can't collide with boats

		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				for (const part of character.GetDescendants()) {
					if (part.IsA("BasePart")) {
						part.Massless = true;
					}
				}

				character.DescendantAdded.Connect((descendant) => {
					if (descendant.IsA("BasePart")) {
						descendant.Massless = true;
					}
				});
			});
		});

		Players.PlayerRemoving.Connect((player) => {
			const result = Object.entries(this.boatOwners).find(([_, p]) => p === player);
			if (result) {
				const [boatId] = result;
				const boat = this.spawnedBoats.get(boatId);
				if (boat) {
					boat.Destroy();
					this.spawnedBoats.delete(boatId);
					this.boatOwners.delete(boatId);
				}
			}
		});

		// Initialize boat spawns
		for (const mapName of Object.keys(mapConfig)) {
			const map = Workspace.FindFirstChild(mapName);
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
	}

	onStart() {
		const boatSpawnCooldown = interval(1);

		Events.spawnBoat.connect((player, boatName) => {
			if (!boatSpawnCooldown(player.UserId)) {
				return;
			}

			const profile = this.profileService.getProfile(player);
			if (!profile) {
				return;
			}
			if (!boatConfig[boatName]) {
				error(`Invalid boat name: ${boatName}`);
			}

			// Check for an existing boat and remove it
			const result = Object.entries(this.boatOwners).find(([_, p]) => p === player);
			if (result) {
				const [boatId] = result;
				const boat = this.spawnedBoats.get(boatId);
				if (boat && boat.Name === boatName) return; // Player already has this boat spawned
				if (boat) {
					boat.Destroy();
					this.spawnedBoats.delete(boatId);
					this.boatOwners.delete(boatId);
				}
			}

			if (profile.Data.ownedBoats.get(boatName) === false) return; // Player doesn't own this boat, so they can't spawn it
			const currentMap = profile.Data.currentMap;

			const unoccupiedBoatSpawn = this.getUnoccupiedBoatSpawn(player, currentMap);
			if (!unoccupiedBoatSpawn) {
				warn(`Couldn't find unoccupied boat spawn for map: ${currentMap}`);
				return;
			}

			const boatModel = this.boatModelFolder.FindFirstChild(boatName);
			if (!boatModel) {
				error(`Couldn't find boat model for boat: ${boatName}`);
			}

			const boatId = HttpService.GenerateGUID();
			this.boatOwners.set(boatId, player);

			const boat = boatModel.Clone() as Model;
			boat.SetAttribute("boatId", boatId);
			boat.PivotTo(unoccupiedBoatSpawn?.GetPivot().add(new Vector3(0, boat.GetExtentsSize().Y / 2, 0)));
			boat.Parent = Workspace;
			this.spawnedBoats.set(boatId, boat);

			for (const descendant of boat.GetDescendants()) {
				if (descendant.IsA("BasePart")) {
					descendant.SetNetworkOwner(player);
				}
			}
		});

		Functions.getOwnsBoat.setCallback((player, boatId) => {
			return this.boatOwners.get(boatId) === player;
		});
	}

	getUnoccupiedBoatSpawn(player: Player, mapName: keyof typeof mapConfig): PVInstance | undefined {
		const boatSpawns = this.boatSpawns.get(mapName);
		if (!boatSpawns) {
			// This is a weird bug, but it's better to handle it just incase.
			warn(`Couldn't find boat spawns for map: ${mapName}`);
			return;
		}
		const playerPos = player.Character?.GetPivot().Position;
		if (!playerPos) return;
		// Loop through all existing boats, and see if any of them are colliding with boat spawns.
		// Return the first unoccupied boat spawn.
		if (this.spawnedBoats.size() > 0) {
			let closestSpawn: PVInstance | undefined;
			let minDistance = math.huge;

			for (const spawn of boatSpawns) {
				const spawnPos = spawn.GetPivot().Position;
				let occupied = false;

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

				if (!occupied) {
					const distance = spawnPos.sub(playerPos).Magnitude;
					if (distance < minDistance) {
						minDistance = distance;
						closestSpawn = spawn;
					}
				}

				return closestSpawn;
			}
		} else {
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
