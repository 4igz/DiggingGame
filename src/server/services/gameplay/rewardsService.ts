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
import { potionConfig } from "shared/config/potionConfig";
import { InventoryService } from "./inventoryService";
import { shovelConfig } from "shared/config/shovelConfig";
import { boatConfig } from "shared/config/boatConfig";
import { metalDetectorConfig } from "shared/config/metalDetectorConfig";
import { LevelService } from "./levelService";
import groupReward from "shared/config/groupReward";
import { limitedOffer } from "shared/config/limitedOffer";
import { codes } from "server/modules/config/codes";
import { gameConstants } from "shared/gameConstants";
import { spontaneousOfferConfig } from "shared/config/spontaneousOfferConfig";

declare function unpack<T>(arr: Array<T>): T;

@Service({})
export class RewardService implements OnStart {
	private playerJoinTimes = new Map<Player, number>();
	private playerRewardClaimMap = new Map<Player, Map<number, boolean | undefined>>();

	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly devproductService: DevproductService,
		private readonly inventoryService: InventoryService,
		private readonly levelService: LevelService,
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

		for (const pack of limitedOffer) {
			assert(pack.size() === 3, "Each limited offer pack must have exactly 3 rewards.");
		}

		// Quickly test all rewards to make sure they're valid
		for (const reward of [...dailyRewards, ...timePlayedRewards, groupReward, ...unpack(limitedOffer)]) {
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
				case "Potions":
					if (potionConfig[reward.itemName!] === undefined) {
						error(`No potion found for reward ${reward.itemName}`);
					}
					break;
				case "Shovels":
					assert(
						shovelConfig[reward.itemName!] !== undefined,
						`No shovel found for reward ${reward.itemName}`,
					);
					break;
				case "Boats":
					assert(boatConfig[reward.itemName!] !== undefined, `No boat found for reward ${reward.itemName}`);
					break;
				case "MetalDetectors":
					assert(
						metalDetectorConfig[reward.itemName!] !== undefined,
						`No metal detector found for reward ${reward.itemName}`,
					);
					break;
				case "SkillPoints":
					assert(
						reward.rewardAmount !== undefined,
						"Must specify rewardAmount when rewardType is SkillPoints.",
					);
					break;
				case "Experience":
					assert(
						reward.rewardAmount !== undefined,
						"Must specify rewardAmount when rewardType is Experience.",
					);
					break;
				default:
					error(`Unknown reward type: ${reward.rewardType}`);
			}
		}

		Functions.claimDailyReward.setCallback((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			// Current time
			const currentTime = os.time();

			// Check if enough time has passed
			if (
				profile.Data.lastDailyClaimed > 0 &&
				profile.Data.lastDailyClaimed + DAILY_REWARD_COOLDOWN > currentTime
			) {
				// Trying to claim reward too soon
				return {
					streak: profile.Data.dailyStreak,
					lastClaimTime: profile.Data.lastDailyClaimed,
				};
			}

			// Handle edge case for new players or corrupted data
			if (profile.Data.lastDailyClaimed <= 0) {
				profile.Data.lastDailyClaimed = 0;
			}

			let reward = dailyRewards[profile.Data.dailyStreak];
			if (!reward) {
				warn(`No reward found for daily streak ${profile.Data.dailyStreak}`);
				profile.Data.dailyStreak = 0;
				reward = dailyRewards[0];
			}

			this.claimReward(player, reward);

			// Save the current time first
			profile.Data.lastDailyClaimed = currentTime;

			// Then update the streak (separated from the time update)
			profile.Data.dailyStreak = (profile.Data.dailyStreak + 1) % dailyRewards.size();

			this.profileService.setProfile(player, profile);
			return {
				streak: profile.Data.dailyStreak,
				lastClaimTime: profile.Data.lastDailyClaimed,
			};
		});

		Events.claimFreeReward.connect((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;
			if (player.IsInGroup(game.CreatorId) && !profile.Data.claimedFreeReward) {
				this.claimReward(player, groupReward);
				profile.Data.claimedFreeReward = true;
				this.profileService.setProfile(player, profile);
			}
		});

		Events.verifyCode.connect((player, code) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			if (profile.Data.redeemedCodes.includes(string.lower(code))) {
				Events.sendInvalidActionPopup(player, "You have already reedemed this code!");
				return;
			}
			const rewards = codes[string.lower(code)];
			if (!rewards) {
				Events.sendInvalidActionPopup(player, "Code doesn't exist.");
				return; // Code doesn't exist.
			}
			Events.sendActionPopup(player, `Reedemed '${string.lower(code)}' successfully!`);
			for (const reward of rewards) {
				this.claimReward(player, reward);
			}
			profile.Data.redeemedCodes.push(string.lower(code));
			this.profileService.setProfile(player, profile);
		});

		Events.claimTimedReward.connect((player) => {
			const joinTime = this.playerJoinTimes.get(player);
			if (joinTime === undefined) return;

			const profile = this.profileService.getProfileLoaded(player).expect();
			if (profile.Data.claimedTimedReward) return;

			if (tick() - joinTime > 60 * gameConstants.TIMED_REWARD_WAIT_TIME - 60 * 3) {
				profile.Data.claimedTimedReward = true;
				this.profileService.setProfile(player, profile);
				this.claimReward(player, { rewardType: "Shovels", itemName: "SteampunkShovel" });
				this.claimReward(player, { rewardType: "Potions", itemName: "L.Luck Potion" });
				this.claimReward(player, { rewardType: "Potions", itemName: "L.Luck Potion" });
				Events.claimedTimedReward(player);
			}
		});

		Events.claimSpontaneousOffer.connect((player, key) => {
			if (key !== 42) return; // So people dont get it by randomly firing remotes
			const profile = this.profileService.getProfileLoaded(player).expect();

			if (profile.Data.claimedSpontaneousOffer) return;

			task.spawn(() => {
				for (const reward of spontaneousOfferConfig) {
					this.claimReward(player, reward);
					task.wait(0.1);
				}
			});

			Events.claimedSpontaneousReward(player);

			profile.Data.claimedSpontaneousOffer = true;
			this.profileService.setProfile(player, profile);
		});

		Functions.getClaimedSpontaneousOffer.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.claimedSpontaneousOffer;
		});

		Signals.completeTimedReward.Connect((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();

			if (profile.Data.claimedTimedReward) return;
			profile.Data.claimedTimedReward = true;
			this.profileService.setProfile(player, profile);

			this.claimReward(player, { rewardType: "Shovels", itemName: "SteampunkShovel" });
			this.claimReward(player, { rewardType: "Potions", itemName: "L.Luck Potion" });
			this.claimReward(player, { rewardType: "Potions", itemName: "L.Luck Potion" });
			Events.claimedTimedReward(player);
		});

		Functions.getHasClaimedFreeReward.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.claimedFreeReward;
		});

		Functions.getClaimedTimedReward.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.claimedTimedReward;
		});

		Signals.giveLimitedOffer.Connect((player, num: 0 | 1 | 2) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const offer = limitedOffer[num];
			if (!offer) {
				error(`Pack num ${num} doesn't exist`);
			}
			for (const reward of offer) {
				this.claimReward(player, reward);
			}
			profile.Data.claimedLimitedOffer = num + 1;
			this.profileService.setProfile(player, profile);
			Events.updateClaimedLimitedOfferPack(player, (num + 1) as 0 | 1 | 2);
		});

		Functions.claimPlaytimeReward.setCallback((player: Player, rewardIndex: number) => {
			const rewardCfg = timePlayedRewards[rewardIndex];
			if (!rewardCfg) {
				warn(`No reward found for playtime reward ${rewardIndex}`);
				return false;
			}

			const playerServerTime = tick() - this.playerJoinTimes.get(player)!;
			const CLAIM_LEEWAY = 5;
			if (playerServerTime + CLAIM_LEEWAY < rewardCfg.unlockTime) {
				return false;
			}

			const claimed = this.playerRewardClaimMap.get(player)!;
			if (claimed.get(rewardIndex)) {
				return false;
			}

			claimed.set(rewardIndex, true);
			this.claimReward(player, rewardCfg);

			const claimedAll = timePlayedRewards.every((_reward, index) => claimed.get(index));
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

		this.profileService.onProfileLoaded.Connect((player, profile) => {
			Events.updateClaimedLimitedOfferPack(player, profile.Data.claimedLimitedOffer as 0 | 1 | 2);
			Events.updateDailyStreak(player, profile.Data.dailyStreak, profile.Data.lastDailyClaimed);
		});

		Functions.getClaimedLimitedOfferPack.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.claimedLimitedOffer as 0 | 1 | 2;
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
				Events.sendClaimedPopup.fire(player, "Money", reward.rewardAmount);
				break;
			case "LuckMultiplier":
				if (reward.rewardLength === undefined) {
					error(`rewardLength must be specified on daily streak when rewardType is '${reward.rewardType}'`);
				}
				this.devproductService.giveLuckMultiplier(player, reward.rewardLength);
				break;
			case "Potions":
				if (potionConfig[reward.itemName!] === undefined) {
					error(`No potion found for reward ${reward.itemName}`);
				}
				this.inventoryService.givePotion(player, reward.itemName!);
				Events.sendClaimedPopup.fire(player, "Potions", reward.itemName!);
				break;
			case "Boats":
				this.inventoryService.onBoatBoughtSuccess(player, reward.itemName!);
				// Events.sendClaimedPopup.fire(player, "Boats", reward.itemName!);
				break;
			case "Shovels":
				this.inventoryService.onItemBoughtSuccess(player, "Shovels", reward.itemName!);
				// Events.sendClaimedPopup.fire(player, "Shovels", reward.itemName!);
				break;
			case "MetalDetectors":
				this.inventoryService.onItemBoughtSuccess(player, "MetalDetectors", reward.itemName!);
				// Events.sendClaimedPopup.fire(player, "MetalDetectors", reward.itemName!);
				break;
			case "Experience":
				this.levelService.addExperience(player, reward.rewardAmount!);
				Events.sendClaimedPopup.fire(player, "Experience", reward.rewardAmount);

				break;
			case "SkillPoints":
				const profile = this.profileService.getProfile(player);
				if (!profile) break;
				profile.Data.skillPoints += reward.rewardAmount!;
				this.profileService.setProfile(player, profile);
				Events.sendClaimedPopup.fire(player, "SkillPoints", 1);
				break;
			default:
				error(`Can't claim: Unknown reward type: ${reward.rewardType}`);
		}
	}
}
