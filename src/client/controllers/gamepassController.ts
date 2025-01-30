import { Controller, OnStart } from "@flamework/core";

@Controller({})
export class GamepassController implements OnStart {
	private gamepasses: Map<string, boolean> = new Map();

	onStart() {
		// Allow gamepasses to be replicated and stored as state here.
	}
}
