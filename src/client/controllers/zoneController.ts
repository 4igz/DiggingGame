//!optimize 2
import { Controller, OnInit, OnRender, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { CollectionService, Lighting, Players, SoundService, TweenService, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { Events, Functions } from "client/network";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/gameConstants";
import { Signals } from "shared/signals";
import { debugWarn } from "shared/util/logUtil";

const COLOR_CORRECTION_PROPERTIES_TABLE = {
	Grasslands: {
		Brightness: 0,
		Contrast: 0,
		Saturation: 0.1,
		TintColor: Color3.fromRGB(255, 255, 255),
	},
	Volcano: {
		Brightness: -0.05,
		Contrast: 0.05,
		Saturation: 0,
		TintColor: Color3.fromRGB(235, 200, 200),
	},
	Frozen: {
		Brightness: 0,
		Contrast: 0,
		Saturation: 0,
		TintColor: Color3.fromRGB(202, 241, 255),
	},
	HighSeas: {
		Brightness: 0,
		Contrast: 0,
		Saturation: 0,
		TintColor: Color3.fromRGB(255, 255, 255),
	},
} as Record<keyof typeof mapConfig, Partial<InstanceProperties<ColorCorrectionEffect>>>;

const WATER_COLOR_PROPERTIES_TABLE = {
	Grasslands: {
		WaterReflectance: 1,
		WaterTransparency: 0.5,
		WaterColor: Color3.fromRGB(60, 127, 211),
	},
	Volcano: {
		WaterReflectance: 0.7,
		WaterTransparency: 0.5,
		WaterColor: Color3.fromRGB(15, 30, 45),
	},
	Frozen: {
		WaterReflectance: 0.8,
		WaterTransparency: 0.4,
		WaterColor: Color3.fromRGB(130, 165, 200),
	},
	HighSeas: {
		WaterReflectance: 1,
		WaterTransparency: 0.5,
		WaterColor: Color3.fromRGB(60, 127, 211),
	},
} as Record<keyof typeof mapConfig, Partial<InstanceProperties<Terrain>>>;

const CLOUD_ZONE_PROPERTIES_TABLE = {
	Grasslands: {
		Cover: 0.5,
		Density: 0.7,
		Color: Color3.fromRGB(255, 255, 255),
	},
	Volcano: {
		Cover: 0.8,
		Density: 0.15,
		Color: Color3.fromRGB(33, 33, 33),
	},
	Frozen: {
		Cover: 0.9,
		Density: 0.7,
		Color: Color3.fromRGB(255, 255, 255),
	},
	HighSeas: {
		Cover: 0.65,
		Density: 0.3,
		Color: Color3.fromRGB(220, 220, 220),
	},
} as Record<keyof typeof mapConfig, Partial<InstanceProperties<Clouds>>>;

const AREA_CHANGE_TWEEN_INFO = new TweenInfo(2, Enum.EasingStyle.Quad);

const clouds = Workspace.Terrain.WaitForChild("Clouds") as Clouds;
const colorCorrection = Lighting.WaitForChild("ZonesCC") as ColorCorrectionEffect;

const areaSounds = SoundService.WaitForChild("Areas") as SoundGroup;

const ZONE_BILLBOARD_DIST_THRESHOLD = 200;

let currentMapName = "";
let isFirstZoneEnter = true;
let currentPlayingAreaSound: Sound | undefined;
let spawned = false;

const rng = new Random();

@Controller({})
export class ZoneController implements OnStart, OnRender {
	public isleZoneMap = new Map<string, Zone>();
	public zonesUpdated = new Signal<() => void>();

	constructor() {}

	onStart() {
		CollectionService.GetInstanceAddedSignal(gameConstants.ISLE_ZONE_TAG).Connect((instance) => {
			if (instance.IsA("PVInstance")) {
				// Ensure this zone part is named after its corresponding map in the config.
				assert(
					mapConfig[instance.Name],
					`Zone ${instance.Name} does not have a corresponding config in mapConfig`,
				);
				const zone = new Zone(instance);
				this.isleZoneMap.set(instance.Name, zone);
				zone.localPlayerEntered.Connect(() => {
					this.onZoneEnter(instance.Name as keyof typeof mapConfig);
				});
				zone.localPlayerExited.Connect(() => {
					this.onZoneLeave();
				});
				this.zonesUpdated.Fire();
			}
		});

		const isleZoneParts = CollectionService.GetTagged(gameConstants.ISLE_ZONE_TAG).filter((inst) => {
			return inst.IsA("PVInstance");
		});

		isleZoneParts.forEach((element) => {
			// Ensure this zone part is named after its corresponding map in the config.
			assert(mapConfig[element.Name], `Zone ${element.Name} does not have a corresponding config in mapConfig`);
			const zone = new Zone(element);
			zone.localPlayerEntered.Connect(() => {
				this.onZoneEnter(element.Name as keyof typeof mapConfig);
			});
			zone.localPlayerExited.Connect(() => {
				this.onZoneLeave();
			});
			this.isleZoneMap.set(element.Name, zone);
		});

		while (!spawned) {
			Functions.requestSpawn()
				.then((islandName) => {
					const island = CollectionService.GetTagged("Map").filter(
						(instance) => instance.Name === islandName,
					)[0];
					const spawnLocation = island.WaitForChild("SpawnLocation") as Model;
					const spawnPos = spawnLocation.GetPivot();
					const character = Players.LocalPlayer.Character || Players.LocalPlayer.CharacterAdded.Wait()[0];
					const extents = spawnLocation.GetExtentsSize();
					const goal = spawnPos.add(
						new Vector3(
							rng.NextNumber(-extents.X, extents.X),
							extents.Y * 2,
							rng.NextNumber(-extents.Z, extents.Z),
						),
					);
					// Wait for HumanoidRootPart so we can ensure that they can be teleported.
					const hrp = character.WaitForChild("HumanoidRootPart") as BasePart;
					hrp.Anchored = false;
					const humanoid = character.WaitForChild("Humanoid") as Humanoid;
					humanoid.WalkSpeed = 19;
					spawned = true;
					task.delay(0.1, () => {
						character.PivotTo(goal);
					});
					Events.teleportSuccess();
				})
				.catch(warn)
				.await();
		}
	}

	onRender() {
		const player = Players.LocalPlayer;
		const character = player.Character;
		if (!character) return;

		// Current state
		const sittingInBoat = player.GetAttribute(gameConstants.BOAT_DRIVER_SITTING) as boolean;
		const currentPos = character.GetPivot().Position;

		// Check if we need to run updates
		// 1) position changed more than 1 stud
		// 2) in-boat status changed (true -> false or false -> true)
		for (const billboard of CollectionService.GetTagged("IsleBillboard")) {
			if (!billboard.IsA("BillboardGui")) continue;
			const boardParent = billboard.Parent;
			if (boardParent && boardParent.IsA("PVInstance")) {
				const distance = currentPos.sub(boardParent.GetPivot().Position).Magnitude;

				// If we're either below threshold or NOT in boat → disable
				if (distance < ZONE_BILLBOARD_DIST_THRESHOLD || !sittingInBoat) {
					billboard.Enabled = false;
				} else {
					billboard.Enabled = true;
					// Update distance text if exists
					const distanceText = billboard.FindFirstChild("Distance") as TextLabel;
					if (distanceText) {
						distanceText.Text = `${math.floor(distance)}m`;
					}
				}
			}
		}
	}

	onZoneEnter(zoneName: keyof typeof mapConfig) {
		if (zoneName === currentMapName) return;
		if (!isFirstZoneEnter) {
			Signals.enteredIsland.Fire(zoneName);
		} else {
			isFirstZoneEnter = false;
		}
		let tweenInfo = AREA_CHANGE_TWEEN_INFO;
		if (isFirstZoneEnter) {
			tweenInfo = new TweenInfo(0);
			isFirstZoneEnter = false;
		}
		TweenService.Create(clouds, tweenInfo, CLOUD_ZONE_PROPERTIES_TABLE[zoneName]).Play();
		TweenService.Create(colorCorrection, tweenInfo, COLOR_CORRECTION_PROPERTIES_TABLE[zoneName]).Play();
		TweenService.Create(Workspace.Terrain, tweenInfo, WATER_COLOR_PROPERTIES_TABLE[zoneName]).Play();
		currentMapName = zoneName;
		this.playAreaSound(zoneName);
	}

	onZoneLeave() {
		// Check if player is in any zones, and if not then assume they are in the sea.
		for (const [name, zone] of this.isleZoneMap) {
			if (zone.findLocalPlayer() === true) {
				this.onZoneEnter(name);
				return;
			}
		}
		TweenService.Create(clouds, AREA_CHANGE_TWEEN_INFO, CLOUD_ZONE_PROPERTIES_TABLE.HighSeas).Play();
		TweenService.Create(colorCorrection, AREA_CHANGE_TWEEN_INFO, COLOR_CORRECTION_PROPERTIES_TABLE.HighSeas).Play();
		TweenService.Create(Workspace.Terrain, AREA_CHANGE_TWEEN_INFO, WATER_COLOR_PROPERTIES_TABLE.HighSeas).Play();
		this.playAreaSound("HighSeas");
		currentMapName = "";
	}

	playAreaSound(zoneName: keyof typeof mapConfig) {
		if (currentPlayingAreaSound) {
			currentPlayingAreaSound.Stop();
			currentPlayingAreaSound.Destroy();
		}
		const sound = areaSounds.FindFirstChild(zoneName) as Sound;
		if (!sound) {
			warn(`No sound found for ${zoneName}`);
			return;
		}
		const newSound = sound.Clone();
		newSound.SoundGroup = areaSounds;
		newSound.Parent = Players.LocalPlayer;
		newSound.Play();
		currentPlayingAreaSound = newSound;
	}

	public getCurrentMapName() {
		return currentMapName;
	}
}
