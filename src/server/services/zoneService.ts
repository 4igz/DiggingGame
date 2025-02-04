import { Service, OnStart } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import { Zone } from "@rbxts/zone-plus";
import { mapConfig } from "shared/config/mapConfig";
import { gameConstants } from "shared/constants";
import { ProfileService } from "./profileService";
import Signal from "@rbxts/goodsignal";

@Service({})
export class ZoneService implements OnStart {
	private zoneMap: Map<string, Zone> = new Map();
	public ChangedMap = new Signal<(player: Player, zoneName: keyof typeof mapConfig) => void>();

	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		for (const zonePart of CollectionService.GetTagged(gameConstants.ISLE_ZONE_TAG)) {
			if (zonePart.IsA("PVInstance")) {
				const zone = new Zone(zonePart);
				zone.playerEntered.Connect((player) => this.onZoneEntered(player, zonePart.Name));
				this.zoneMap.set(zonePart.Name, zone);
			}
		}
	}

	onZoneEntered(player: Player, zoneName: keyof typeof mapConfig) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		if (profile.Data.currentMap === zoneName) return;
		profile.Data.currentMap = zoneName;
		this.profileService.setProfile(player, profile);
		this.ChangedMap.Fire(player, zoneName);
	}
}
