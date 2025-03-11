import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { ProfileService } from "../backend/profileService";
import { dailyRewards, DAILY_REWARD_COOLDOWN } from "shared/config/dailyRewardConfig";
import { MoneyService } from "../backend/moneyService";
import { DevproductService } from "../backend/devproductService";
import { Players } from "@rbxts/services";
import { Reward } from "shared/networkTypes";
import { timePlayedRewards } from "shared/config/timePlayedConfig";
import { Signals } from "shared/signals";

@Service({})
export class DailyRewardsService implements OnStart {
	private playerJoinTimes = new Map<Player, number>();
	private playerRewardClaimMap = new Map<Player, Map<number, boolean | undefined>>();

	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly devproductService: DevproductService,
	) {}

	onStart() {
		Players.PlayerAdded.Connect((player) => {
			this.playerJoinTimes.set(player, tick());
			this.playerRewardClaimMap.set(player, new Map());
		});

		Players.PlayerRemoving.Connect((player) => {
			this.playerJoinTimes.delete(player);
			this.playerRewardClaimMap.delete(player);
		});

		Signals.unlockPlaytimeRewards.Connect((player) => {
			const plrJoinTime = this.playerJoinTimes.get(player);
			this.playerJoinTimes.set(player, plrJoinTime! - timePlayedRewards[timePlayedRewards.size() - 1].unlockTime);
			Events.boughtPlaytimeRewardSkip(player);
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

			const playerServerTime = tick() - this.playerJoinTimes.get(player)!;
			if (playerServerTime < rewardCfg.unlockTime) {
				return false;
			}

			const claimed = this.playerRewardClaimMap.get(player)!;
			if (claimed.get(rewardIndex)) {
				return false;
			}

			claimed.set(rewardIndex, true);
			this.claimReward(player, rewardCfg);

			const claimedAll = timePlayedRewards.every((reward, index) => claimed.get(index));
			if (claimedAll) {
				this.playerRewardClaimMap.set(player, new Map());
			}

			return true;
		});

		Functions.getLastDailyClaimTime.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.lastDailyClaimed;
		});

		Functions.getDailyStreak.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.dailyStreak;
		});
	}

	claimReward(player: Player, reward: Reward) {
		switch (reward.rewardType) {
			case "Money":
				assert(
					reward.rewardAmount !== undefined,
					"rewardAmount must be specfied on daily streak when rewardType is 'Money'`",
				);
				this.moneyService.giveMoney(player, reward.rewardAmount!, true);
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
