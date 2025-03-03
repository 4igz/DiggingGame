import { Service } from "@flamework/core";
import { ProfileService } from "../profileService";
import { Players, RunService } from "@rbxts/services";

@Service({})
export class BanService {
	constructor(private readonly profileService: ProfileService) {}

	async banPlayer(player: Player, reason: string, duration: number = -1) {
		if (RunService.IsStudio()) {
			warn("Ban attempt in studio, not actually banning.");
			return Promise.resolve();
		}
		const profile = this.profileService.getProfile(player);
		if (profile) {
			profile.Data.banTimes += 1;
			this.profileService.setProfile(player, profile);
		}
		Players.BanAsync({
			DisplayReason: "You have been banned from the game.",
			UserIds: [player.UserId],
			PrivateReason: reason,
			Duration: duration,
		});
	}
}
