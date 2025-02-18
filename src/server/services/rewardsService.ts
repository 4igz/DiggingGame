import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { ProfileService } from "./profileService";
import { dailyRewards, DAILY_REWARD_COOLDOWN } from "shared/config/dailyRewardConfig";
import { MoneyService } from "./moneyService";
import { DevproductService } from "./devproductService";
import { Players } from "@rbxts/services";
import { Reward } from "shared/networkTypes";
import { timePlayedRewards } from "shared/config/timePlayedConfig";

@Service({})
export class DailyRewardsService implements OnStart {
	private playerJoinTimes = new Map<Player, number>();

	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly devproductService: DevproductService,
	) {
		Players.PlayerAdded.Connect((player) => {
			this.playerJoinTimes.set(player, tick());
		});

		Players.PlayerRemoving.Connect((player) => {
			this.playerJoinTimes.delete(player);
		});
	}

	onStart() {
		Events.claimDailyReward.connect((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			if (profile.Data.lastDailyClaimed + DAILY_REWARD_COOLDOWN > tick()) {
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
			this.claimReward(player, reward);

			Events.updateDailyStreak(player, profile.Data.dailyStreak, profile.Data.lastDailyClaimed);
			this.profileService.setProfile(player, profile);
		});

		Functions.claimPlaytimeReward.setCallback((player: Player, rewardIndex: number) => {
			const rewardCfg = timePlayedRewards[rewardIndex];
			if (!rewardCfg) {
				warn(`No reward found for playtime reward ${rewardIndex}`);
				return false;
			}

			const profile = this.profileService.getProfile(player);
			if (!profile) {
				return false;
			}

			const playerServerTime = tick() - this.playerJoinTimes.get(player)!;
			if (playerServerTime < rewardCfg.unlockTime) {
				return false;
			}

			this.claimReward(player, rewardCfg);

			return true;
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

		// Quickly test all rewards to make sure they're valid
		for (const reward of [...dailyRewards, ...timePlayedRewards]) {
			switch (reward.rewardType) {
				case "Money":
					assert(
						reward.rewardAmount !== undefined,
						"rewardAmount must be specfied on daily streak when rewardType is 'Money'`",
					);
					break;
				case "LuckMultiplier":
					if (reward.rewardLength === undefined) {
						error(
							`rewardLength must be specified on daily streak when rewardType is '${reward.rewardType}'`,
						);
					}
					break;
				default:
					error(`Unknown reward type: ${reward.rewardType}`);
			}
		}
	}

	claimReward(player: Player, reward: Reward) {
		switch (reward.rewardType) {
			case "Money":
				assert(
					reward.rewardAmount !== undefined,
					"rewardAmount must be specfied on daily streak when rewardType is 'Money'`",
				);
				this.moneyService.giveMoney(player, reward.rewardAmount!);
				break;
			case "LuckMultiplier":
				if (reward.rewardLength === undefined) {
					error(`rewardLength must be specified on daily streak when rewardType is '${reward.rewardType}'`);
				}
				this.devproductService.giveLuckMultiplier(player, reward.rewardLength);
				break;
			default:
				error(`Unknown reward type: ${reward.rewardType}`);
		}
	}
}
