import { Controller, OnInit, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { CollectionService, Players, SoundService, TweenService, Workspace } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/constants";

@Controller({})
export class ZoneController implements OnInit {
	private isleZoneParts = CollectionService.GetTagged(gameConstants.ISLE_ZONE_TAG).filter((inst) => {
		return inst.IsA("PVInstance");
	});
	public isleZoneMap = new Map<string, Zone>();

	public zonesUpdated = new Signal<() => void>();

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
	} as Record<keyof typeof mapConfig, Partial<InstanceProperties<Clouds>>>;

	private clouds = Workspace.Terrain.WaitForChild("Clouds") as Clouds;
	private currentMapName = "Grasslands";

	constructor() {
		this.isleZoneParts.forEach((element) => {
			// Ensure this zone part is named after it's corresponding map in the config.
			assert(mapConfig[element.Name], `Zone ${element.Name} does not have a corresponding config in mapConfig`);
			const zone = new Zone(element);
			zone.localPlayerEntered.Connect(() => {
				this.onZoneEnter(element.Name as keyof typeof mapConfig);
			});
			this.isleZoneMap.set(element.Name, zone);
		});

		CollectionService.GetInstanceAddedSignal(gameConstants.ISLE_ZONE_TAG).Connect((instance) => {
			if (instance.IsA("PVInstance")) {
				// Ensure this zone part is named after it's corresponding map in the config.
				assert(
					mapConfig[instance.Name],
					`Zone ${instance.Name} does not have a corresponding config in mapConfig`,
				);
				const zone = new Zone(instance);
				this.isleZoneMap.set(instance.Name, zone);
				zone.localPlayerEntered.Connect(() => {
					this.onZoneEnter(instance.Name as keyof typeof mapConfig);
				});
				this.zonesUpdated.Fire();
			}
		});
	}

	onInit() {}

	onZoneEnter(zoneName: keyof typeof mapConfig) {
		TweenService.Create(
			this.clouds,
			new TweenInfo(2, Enum.EasingStyle.Quad),
			this.CLOUD_ZONE_PROPERTIES_TABLE[zoneName],
		).Play();
		this.currentMapName = zoneName;
		this.playAreaSound(zoneName);
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
		sound.Parent = Players.LocalPlayer;
		sound.Play();
		this.currentPlayingAreaSound = sound;
	}

	public getCurrentMapName() {
		return this.currentMapName;
	}
}
