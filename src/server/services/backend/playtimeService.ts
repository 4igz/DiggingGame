import { Service, OnStart } from "@flamework/core";
import { LoadedProfile, ProfileService } from "./profileService";
import Signal from "@rbxts/goodsignal";

@Service({})
export class PlaytimeService implements OnStart {
	private playtimeUpdateInterval = 1; // Choose when to update

	public playtimeUpdated = new Signal<(player: Player, totalSeconds: number) => void>();

	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		while (true) {
			task.wait(this.playtimeUpdateInterval);
			this.updateAllPlaytimes();
		}
	}

	private updateAllPlaytimes() {
		for (const [player, profile] of this.profileService.getLoadedProfiles()) {
			this.incrementPlaytime(player, profile);
		}
	}

	private incrementPlaytime(player: Player, profile: LoadedProfile) {
		// Fire signal for leaderstat update only
		profile.Data.playtime += this.playtimeUpdateInterval;
		this.playtimeUpdated.Fire(player, profile.Data.playtime);
		this.profileService.setProfile(player, profile);
	}

	public getCurrentPlaytime(player: Player): number {
		const profile = this.profileService.getProfile(player);
		if (!profile) return 0;
		return profile.Data.playtime;
	}
}
