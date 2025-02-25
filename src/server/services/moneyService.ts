import { Service, OnStart } from "@flamework/core";
import EternityNum from "shared/util/eternityNum";
import { ProfileService } from "./profileService";
import { Signals } from "shared/signals";
import { Events } from "server/network";
import { GamepassService } from "./gamepassService";
import { gameConstants } from "shared/constants";
import Signal from "@rbxts/goodsignal";
import { EN } from "shared/networkTypes";

@Service({})
export class MoneyService implements OnStart {
	public moneyChanged = new Signal<(player: Player, amount: EN) => void>();

	constructor(private readonly profileService: ProfileService, private readonly gamepassService: GamepassService) {}

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

	giveMoney(player: Player, amount: number, can2x = false) {
		// Add money to player
		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		// Double money if can2x is true and they own the 2x cash gamepass
		if (can2x && this.gamepassService.ownsGamepass(player, gameConstants.GAMEPASS_IDS.x2Cash) === true) {
			amount *= 2;
		}

		const moneyEN = EternityNum.add(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount));

		profile.Data.money = EternityNum.toString(moneyEN);
		this.profileService.setProfile(player, profile);
		Events.updateMoney.fire(player, profile.Data.money);
		this.moneyChanged.Fire(player, moneyEN);
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
