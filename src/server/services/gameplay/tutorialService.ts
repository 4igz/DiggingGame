import { Service, OnStart } from "@flamework/core";
import { ProfileService } from "../backend/profileService";
import { RewardService } from "./rewardsService";
import { Events, Functions } from "server/network";

@Service({})
export class TutorialService implements OnStart {
	constructor(private readonly profileService: ProfileService, private readonly rewardService: RewardService) {}

	onStart() {
		Functions.getTutorial.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const firstJoin = profile.Data.isFirstJoin;

			profile.Data.isFirstJoin = false;
			this.profileService.setProfile(player, profile);

			return firstJoin;
		});

		Events.completedTutorial.connect((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const claimedTutorialRewards = profile.Data.claimedTutorialRewards;

			if (!claimedTutorialRewards) {
				this.endTutorial(player);
				profile.Data.claimedTutorialRewards = true;
				this.profileService.setProfile(player, profile);
			}
		});
	}

	endTutorial(player: Player) {
		this.rewardService.claimReward(player, { rewardType: "Money", rewardAmount: 500 });
		this.rewardService.claimReward(player, { rewardType: "Potions", itemName: "M.Luck Potion" });
		Events.endTutorial(player);
	}
}
