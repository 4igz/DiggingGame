import { Controller, OnInit, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { CollectionService } from "@rbxts/services";
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

	constructor() {
		this.isleZoneParts.forEach((element) => {
			// Ensure this zone part is named after it's corresponding map in the config.
			assert(mapConfig[element.Name], `Zone ${element.Name} does not have a corresponding config in mapConfig`);
			const zone = new Zone(element);
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
				this.zonesUpdated.Fire();
			}
		});
	}

	onInit() {}
}
