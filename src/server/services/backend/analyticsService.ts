import { Service, OnStart } from "@flamework/core";
import { AnalyticsService } from "@rbxts/services";
import { GlobalEvents } from "shared/network";
import { ProfileService } from "./profileService";

@Service({})
export class AnalyticsServiceClass implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		// Listen to bad requests and log them
		// This shouldn't be used for moderative purposes, but rather to track down bugs
		// Though this could potentially alert suspicious behavior from bad actors messing with the networking code.
		GlobalEvents.registerHandler("onBadRequest", (player, message) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;
			AnalyticsService.LogCustomEvent(player, "FiredWrongEventData", ++profile.Data.firedWrongEventDataTimes, {
				badRequestData: message,
			});
			this.profileService.setProfile(player, profile);
		});
	}
}
