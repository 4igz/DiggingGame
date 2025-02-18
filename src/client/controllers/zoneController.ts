import { Controller, OnInit, OnRender, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { CollectionService, Lighting, Players, SoundService, TweenService, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { Events } from "client/network";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/constants";

@Controller({})
export class ZoneController implements OnInit, OnRender {
	private ZONE_BILLBOARD_DIST_THRESHOLD = 200;

	private isleZoneParts = CollectionService.GetTagged(gameConstants.ISLE_ZONE_TAG).filter((inst) => {
		return inst.IsA("PVInstance");
	});
	public isleZoneMap = new Map<string, Zone>();

	public zonesUpdated = new Signal<() => void>();

	private isFirstZoneEnter = true;

	private areaSounds = SoundService.WaitForChild("Areas") as SoundGroup;
	private currentPlayingAreaSound: Sound | undefined;

	private CLOUD_ZONE_PROPERTIES_TABLE = {
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

	private COLOR_CORRECTION_PROPERTIES_TABLE = {
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

	private WATER_COLOR_PROPERTIES_TABLE = {
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

	private AREA_CHANGE_TWEEN_INFO = new TweenInfo(2, Enum.EasingStyle.Quad);

	private clouds = Workspace.Terrain.WaitForChild("Clouds") as Clouds;
	private colorCorrection = Lighting.WaitForChild("ZonesCC") as ColorCorrectionEffect;
	private currentMapName = "Grasslands";
	private prevPlayerPos = new Vector3();

	constructor() {
		this.isleZoneParts.forEach((element) => {
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

		// This is important because this is how we know that the island has streamed in before we teleport the player to it.
		Events.teleportToIsland.connect((islandName) => {
			const island = Workspace.WaitForChild(islandName);
			const spawnPos = (island.WaitForChild("SpawnLocation") as SpawnLocation).CFrame;
			const character = Players.LocalPlayer.Character || Players.LocalPlayer.CharacterAdded.Wait()[0];
			const goal = spawnPos.add(new Vector3(0, 5, 0));
			// Wait for HumanoidRootPart so we can ensure that they can be teleported.
			character.WaitForChild("HumanoidRootPart");
			character.PivotTo(goal);
			Events.teleportSuccess.fire();
		});
	}

	onInit() {}

	onRender() {
		const player = Players.LocalPlayer;
		const character = player.Character;
		const sittingInBoat = player.GetAttribute("SittingInBoatDriverSeat") as boolean;
		if (character) {
			const pos = character.GetPivot().Position;
			if (!this.prevPlayerPos.FuzzyEq(pos, 1)) {
				for (const billboard of CollectionService.GetTagged("IsleBillboard")) {
					if (!billboard.IsA("BillboardGui")) continue;
					const boardParent = billboard.Parent;
					if (boardParent !== undefined && boardParent.IsA("PVInstance")) {
						const distance = pos.sub(boardParent.GetPivot().Position).Magnitude;
						if (distance < this.ZONE_BILLBOARD_DIST_THRESHOLD || !sittingInBoat) {
							billboard.Enabled = false;
							continue;
						} else {
							billboard.Enabled = true;
						}
						const distanceText = billboard.FindFirstChild("Distance") as TextLabel;
						if (distanceText) {
							distanceText.Text = `${math.floor(distance)}m`;
						}
					}
				}
			}
		}
	}

	onZoneEnter(zoneName: keyof typeof mapConfig) {
		let tweenInfo = this.AREA_CHANGE_TWEEN_INFO;
		if (this.isFirstZoneEnter) {
			tweenInfo = new TweenInfo(0);
			this.isFirstZoneEnter = false;
		}
		TweenService.Create(this.clouds, tweenInfo, this.CLOUD_ZONE_PROPERTIES_TABLE[zoneName]).Play();
		TweenService.Create(this.colorCorrection, tweenInfo, this.COLOR_CORRECTION_PROPERTIES_TABLE[zoneName]).Play();
		TweenService.Create(Workspace.Terrain, tweenInfo, this.WATER_COLOR_PROPERTIES_TABLE[zoneName]).Play();
		this.currentMapName = zoneName;
		this.playAreaSound(zoneName);
	}

	onZoneLeave() {
		// Check if player is in any zones, and if not then assume they are in the sea.
		let playerIsInZone = false;
		for (const [, zone] of this.isleZoneMap) {
			if (zone.findLocalPlayer()) {
				playerIsInZone = true;
				break;
			}
		}
		if (!playerIsInZone) {
			TweenService.Create(
				this.clouds,
				this.AREA_CHANGE_TWEEN_INFO,
				this.CLOUD_ZONE_PROPERTIES_TABLE.HighSeas,
			).Play();
			TweenService.Create(
				this.colorCorrection,
				this.AREA_CHANGE_TWEEN_INFO,
				this.COLOR_CORRECTION_PROPERTIES_TABLE.HighSeas,
			).Play();
			TweenService.Create(
				Workspace.Terrain,
				this.AREA_CHANGE_TWEEN_INFO,
				this.WATER_COLOR_PROPERTIES_TABLE.HighSeas,
			).Play();
			this.playAreaSound("HighSeas");
		}
	}

	playAreaSound(zoneName: keyof typeof mapConfig) {
		if (this.currentPlayingAreaSound) {
			this.currentPlayingAreaSound.Stop();
			this.currentPlayingAreaSound.Destroy();
		}
		const sound = this.areaSounds.FindFirstChild(zoneName) as Sound;
		if (!sound) {
			warn(`No sound found for ${zoneName}`);
			return;
		}
		const newSound = sound.Clone();
		newSound.SoundGroup = this.areaSounds;
		newSound.Parent = Players.LocalPlayer;
		newSound.Play();
		this.currentPlayingAreaSound = newSound;
	}

	public getCurrentMapName() {
		return this.currentMapName;
	}
}
