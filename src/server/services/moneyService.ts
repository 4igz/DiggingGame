import { Service, OnStart } from "@flamework/core";
import EternityNum from "shared/util/eternityNum";
import { ProfileService } from "./profileService";
import { Signals } from "shared/signals";
import { Events } from "server/network";

@Service({})
export class MoneyService implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		Signals.addMoney.Connect((player, amount) => {
			this.giveMoney(player, amount);
		});
	}

	hasEnoughMoney(player: Player, amount: number) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return false;
		return EternityNum.meeq(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount));
	}

	giveMoney(player: Player, amount: number) {
		// Add money to player
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		profile.Data.money = EternityNum.toString(
			EternityNum.add(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount)),
		);
		Events.updateMoney.fire(player, profile.Data.money);
		this.profileService.setProfile(player, profile);
	}

	takeMoney(player: Player, amount: number) {
		// Add money to player
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		profile.Data.money = EternityNum.toString(
			EternityNum.sub(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount)),
		);
		Events.updateMoney.fire(player, profile.Data.money);
		this.profileService.setProfile(player, profile);
	}
}
