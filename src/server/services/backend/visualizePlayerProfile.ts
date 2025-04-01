import { Service, OnStart } from "@flamework/core";
import { ProfileService } from "./profileService";
import { RunService } from "@rbxts/services";

@Service({})
export class VisualizePlayerProfile implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		this.profileService.onProfileLoaded.Connect((player, profile) => {
			if (!RunService.IsStudio()) return;
			for (const [k, v] of pairs(profile.Data)) {
				if (type(v) !== "table") {
					player.SetAttribute(k, v as AttributeValue);
				}
			}
		});

		this.profileService.profileChanged.Connect((player, profile) => {
			if (!RunService.IsStudio()) return;
			for (const [k, v] of pairs(profile.Data)) {
				if (type(v) !== "table") {
					player.SetAttribute(k, v as AttributeValue);
				}
			}
		});
	}
}
