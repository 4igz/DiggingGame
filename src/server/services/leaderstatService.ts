import { Service, OnStart } from "@flamework/core";
import { ProfileService } from "./profileService";
import EternityNum from "shared/util/eternityNum";
import { Functions } from "server/network";

@Service({})
export class LeaderstatService implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		this.profileService.onProfileLoaded.Connect((player, profile) => {
			const leaderstats = new Instance("Folder");
			leaderstats.Name = "leaderstats";
			leaderstats.Parent = player;

			const money = new Instance("StringValue");
			money.Name = "Money";
			money.Value = EternityNum.short(EternityNum.fromString(profile.Data.money));
			money.Parent = leaderstats;
		});

		this.profileService.profileChanged.Connect((player, profile) => {
			const leaderstats = player.FindFirstChild("leaderstats");
			if (leaderstats) {
				const money = leaderstats.FindFirstChild("Money") as StringValue | undefined;
				if (money) {
					money.Value = EternityNum.short(EternityNum.fromString(profile.Data.money));
				}
			}
		});

		Functions.getMoneyShortString.setCallback((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return "0";
			return profile.Data.money;
		});
	}
}
