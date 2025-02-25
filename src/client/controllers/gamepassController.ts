//!optimize 2
//!native
import { Controller, OnStart } from "@flamework/core";
import { Events, Functions } from "client/network";
import { gameConstants } from "shared/constants";

const gamepasses: Map<keyof typeof gameConstants.GAMEPASS_IDS, boolean> = new Map();

@Controller({})
export class GamepassController implements OnStart {
	onStart() {
		// Allow gamepasses to be replicated and stored as state here.
		Functions.getOwnedGamepasses().then((gamepasses) => {
			gamepasses = gamepasses;
		});

		// Listen for gamepass updates.
		Events.updateOwnedGamepasses.connect((gamepasses) => {
			gamepasses = gamepasses;
		});
	}

	getOwnsGamepass(gamepassName: keyof typeof gameConstants.GAMEPASS_IDS): boolean {
		return gamepasses.get(gamepassName) ?? false;
	}
}
