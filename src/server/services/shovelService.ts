import { Service, OnStart } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";
import { shovelConfig } from "shared/config/shovelConfig";
import { findFurthestPointWithinRadius } from "shared/util/detectorUtil";
import { ProfileService } from "./profileService";
import { gameConstants } from "shared/constants";
import { Events } from "server/network";
import { interval } from "shared/util/interval";

const Maps = CollectionService.GetTagged("Map");

@Service({})
export class ShovelService implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {}

	instanceIsShovel(instance: Instance) {
		return instance.IsA("Tool") && shovelConfig[instance.Name] !== undefined;
	}
}
