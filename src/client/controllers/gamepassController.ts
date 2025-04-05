//!optimize 2
import { Controller, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { SoundService } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { gameConstants } from "shared/gameConstants";
import { Signals } from "shared/signals";

let clientGamepasses: Map<keyof typeof gameConstants.GAMEPASS_IDS, boolean> = new Map();

@Controller({})
export class GamepassController implements OnStart {
	onStart() {
		// Allow gamepasses to be replicated and stored as state here.
		Functions.getOwnedGamepasses()
			.then((gamepasses) => {
				clientGamepasses = gamepasses;
			})
			.catch((e) => {
				warn(e);
			});

		// Listen for gamepass updates.
		Events.updateOwnedGamepasses.connect((gamepasses) => {
			clientGamepasses = gamepasses;
		});

		Events.notifyBought.connect((productName, _) => {
			Signals.actionPopup.Fire("Thanks for supporting us!");
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("GpPurchase") as Sound);
		});
	}

	getOwnsGamepass(gamepassName: keyof typeof gameConstants.GAMEPASS_IDS): boolean {
		const result = clientGamepasses.get(gamepassName);
		if (result === undefined) {
			warn(`Gamepass ${gamepassName} not found in gamepasses`);
			return false;
		}
		return result;
	}
}
