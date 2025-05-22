import { Service, OnStart } from "@flamework/core";
import EternityNum from "shared/util/eternityNum";
import { ProfileService } from "./profileService";
import { Signals } from "shared/signals";
import { Events } from "server/network";
import { GamepassService } from "./gamepassService";
import { gameConstants } from "shared/gameConstants";
import Signal from "@rbxts/goodsignal";
import { EN } from "shared/networkTypes";
import { FriendCountService } from "./friendCountService";

@Service({})
export class MoneyService implements OnStart {
	public moneyChanged = new Signal<(player: Player, amount: EN) => void>();

	constructor(
		private readonly profileService: ProfileService,
		private readonly gamepassService: GamepassService,
		private readonly friendCountService: FriendCountService,
	) {}

	onStart() {
		Signals.addMoney.Connect((player, amount) => {
			this.giveMoney(player, amount);
		});

		this.profileService.onProfileLoaded.Connect((player, profile) => {
			Events.updateMoney.fire(player, profile.Data.money);

			if (profile.Data.allTimeMoney === 0) {
				profile.Data.allTimeMoney = EternityNum.toNumber(EternityNum.fromString(profile.Data.money));
			}
		});
	}

	hasEnoughMoney(player: Player, amount: number) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return false;
		return EternityNum.meeq(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount));
	}

	giveMoney(player: Player, amount: number, canMultiply = false) {
		// Add money to player
		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		// Double money if can2x is true and they own the 2x cash gamepass
		if (canMultiply && this.gamepassService.ownsGamepass(player, gameConstants.GAMEPASS_IDS.x2Cash) === true) {
			amount *= 2;
		}

		if (canMultiply && player.MembershipType === Enum.MembershipType.Premium) {
			amount *= 1.1;
		}

		const friendMult = this.friendCountService.getMultiplier(player);

		if (canMultiply) {
			amount *= friendMult;
		}

		const moneyEN = EternityNum.add(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount));

		profile.Data.allTimeMoney += amount; // For leaderboards
		profile.Data.money = EternityNum.toString(moneyEN);
		this.profileService.setProfile(player, profile);
		Events.updateMoney.fire(player, profile.Data.money);

		this.moneyChanged.Fire(player, moneyEN);
	}

	takeMoney(player: Player, amount: number) {
		// Add money to player
		const profile = this.profileService.getProfile(player);
		if (!profile) return;
		const moneyEN = EternityNum.sub(EternityNum.fromString(profile.Data.money), EternityNum.fromNumber(amount));
		profile.Data.money = EternityNum.toString(moneyEN);
		Events.updateMoney.fire(player, profile.Data.money);
		this.profileService.setProfile(player, profile);
		this.moneyChanged.Fire(player, moneyEN);
	}
}
