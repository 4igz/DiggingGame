import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { ProfileService } from "./profileService";
import { dailyRewards, REWARD_COOLDOWN } from "shared/config/dailyRewardConfig";
import { MoneyService } from "./moneyService";
import { DevproductService } from "./devproductService";
import { Players } from "@rbxts/services";
import { gameConstants } from "shared/constants";

@Service({})
export class DailyRewardsService implements OnStart {
	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly devproductService: DevproductService,
	) {}

	onStart() {
		Events.claimDailyReward.connect((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			if (profile.Data.lastDailyClaimed + REWARD_COOLDOWN > tick()) {
				// Trying to claim reward too soon
				return;
			}

			profile.Data.dailyStreak++;
			profile.Data.lastDailyClaimed = tick();
			profile.Data.dailyStreak = profile.Data.dailyStreak % dailyRewards.size(); // Resets streak if it reaches the end

			let reward = dailyRewards[profile.Data.dailyStreak];
			if (!reward) {
				warn(`No reward found for daily streak ${profile.Data.dailyStreak}`);
				profile.Data.dailyStreak = 0;
				reward = dailyRewards[0];
			}

			switch (reward.rewardType) {
				case "Money":
					this.moneyService.giveMoney(player, reward.rewardAmount);
					break;
				case "LuckMultiplier":
					if (reward.rewardLength === undefined) {
						error(`rewardLength must be specfied on daily streak: ${profile.Data.dailyStreak}`);
					}
					this.devproductService.giveLuckMultiplier(player, reward.rewardLength);
					break;
				default:
					error(`Unknown reward type: ${reward.rewardType}`);
			}

			Events.updateDailyStreak(player, profile.Data.dailyStreak, profile.Data.lastDailyClaimed);
			this.profileService.setProfile(player, profile);
		});

		Functions.getLastDailyClaimTime.setCallback((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) {
				while (player && player.IsDescendantOf(Players)) {
					const [playerProfileLoaded, loadedProfile] = this.profileService.onProfileLoaded.Wait();
					if (playerProfileLoaded === player) {
						return loadedProfile.Data.lastDailyClaimed;
					}
				}
				return undefined; // We tried our best
			}

			return profile.Data.lastDailyClaimed;
		});

		Functions.getDailyStreak.setCallback((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) {
				while (player && player.IsDescendantOf(Players)) {
					const [playerProfileLoaded, loadedProfile] = this.profileService.onProfileLoaded.Wait();
					if (playerProfileLoaded === player) {
						return loadedProfile.Data.dailyStreak;
					}
				}
				return undefined; // We tried our best
			}

			return profile.Data.dailyStreak;
		});
	}
}
