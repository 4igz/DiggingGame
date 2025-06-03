import { Controller, OnStart } from "@flamework/core";
import { TextChatService } from "@rbxts/services";
import { Events } from "client/network";

@Controller({})
export class MessagePoster implements OnStart {
	onStart() {
		const general = TextChatService.WaitForChild("TextChannels").WaitForChild("RBXGeneral") as TextChannel;

		Events.postMessage.connect((message) => {
			general.DisplaySystemMessage(message);
		});
	}
}
