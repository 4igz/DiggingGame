import { Controller, OnStart } from "@flamework/core";
import { Events, Functions } from "client/network";
import { gameConstants } from "shared/constants";

@Controller({})
export class GamepassController implements OnStart {
	private gamepasses: Map<keyof typeof gameConstants.GAMEPASS_IDS, boolean> = new Map();

	onStart() {
		// Allow gamepasses to be replicated and stored as state here.
		Functions.getOwnedGamepasses().then((gamepasses) => {
			this.gamepasses = gamepasses;
		});

		// Listen for gamepass updates.
		Events.updateOwnedGamepasses.connect((gamepasses) => {
			this.gamepasses = gamepasses;
		});
	}

	getOwnsGamepass(gamepassName: keyof typeof gameConstants.GAMEPASS_IDS): boolean {
		return this.gamepasses.get(gamepassName) ?? false;
	}
}
