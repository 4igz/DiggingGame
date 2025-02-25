import { Service, OnStart } from "@flamework/core";
import { ProfileService } from "./profileService";
import EternityNum from "shared/util/eternityNum";
import { Events, Functions } from "server/network";
import { MoneyService } from "./moneyService";
import { EN } from "shared/networkTypes";

@Service({})
export class LeaderstatService implements OnStart {
	constructor(private readonly profileService: ProfileService, private readonly moneyService: MoneyService) {}

	onStart() {
		for (const [player, profile] of this.profileService.getLoadedProfiles()) {
			const leaderstats = new Instance("Folder");
			leaderstats.Name = "leaderstats";
			leaderstats.Parent = player;

			const money = new Instance("StringValue");
			money.Name = "Money";
			money.Value = EternityNum.short(EternityNum.fromString(profile.Data.money));
			money.Parent = leaderstats;
		}

		this.profileService.onProfileLoaded.Connect((player, profile) => {
			const leaderstats = new Instance("Folder");
			leaderstats.Name = "leaderstats";
			leaderstats.Parent = player;

			const money = new Instance("StringValue");
			money.Name = "Money";
			money.Value = EternityNum.short(EternityNum.fromString(profile.Data.money));
			money.Parent = leaderstats;
		});

		this.moneyService.moneyChanged.Connect((player, moneyValue: EN) => {
			const leaderstats = player.FindFirstChild("leaderstats");
			if (leaderstats) {
				const money = leaderstats.FindFirstChild("Money") as StringValue | undefined;
				if (money) {
					money.Value = EternityNum.short(moneyValue);
				}
			}
		});

		Functions.getMoneyShortString.setCallback((player) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) {
				// Sometimes the player requests their money on the client before the profile is loaded,
				// We need to handle this case and defer this call to the updateMoney event
				this.profileService.onProfileLoaded.Once((player, profile) => {
					Events.updateMoney.fire(player, profile.Data.money);
				});
				return "0";
			}
			return profile.Data.money;
		});
	}
}
