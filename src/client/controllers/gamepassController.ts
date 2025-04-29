//!optimize 2
import { Controller, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import Object from "@rbxts/object-utils";
import { MarketplaceService, SoundService } from "@rbxts/services";
import Sift from "@rbxts/sift";
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

	getOwnsGamepass(gamepassRef: keyof typeof gameConstants.GAMEPASS_IDS | number): boolean {
		// If gamepassRef is a number (ID), we need to find the corresponding name
		if (type(gamepassRef) === "number") {
			// If not found by ID, look for the name associated with this ID
			for (const [name, value] of pairs(gameConstants.GAMEPASS_IDS)) {
				if (value === gamepassRef) {
					// Found the name, now check if it exists in clientGamepasses
					return clientGamepasses.get(name) === true;
				}
			}
		}
		// If gamepassRef is a string (name), try to get it directly
		else if (type(gamepassRef) === "string") {
			const result = clientGamepasses.get(gamepassRef as string);
			if (result !== undefined) {
				return result;
			}
		}

		// If we reach here, the gamepass wasn't found
		warn(`Gamepass ${gamepassRef} not found in gamepasses`);
		return false;
	}
}
