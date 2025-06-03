import { Service, OnStart } from "@flamework/core";
import { Events } from "server/network";

@Service({})
export class ChatTipService implements OnStart {
	private POST_TIP_COOLDOWN = 5;

	private CHAT_TIPS = [
		"TIP: Visit the dock to buy a boat to visit better islands!",
		"TIP: Explore better islands for better treasures!",
	];

	private tipIdx = 0;

	onStart() {
		while (task.wait(this.POST_TIP_COOLDOWN)) {
			const currentIdx = this.tipIdx++;
			this.tipIdx = this.tipIdx % this.CHAT_TIPS.size();

			const message = this.CHAT_TIPS[currentIdx];
			print(message);
			Events.postMessage.broadcast(this.CHAT_TIPS[currentIdx]);
		}
	}
}
