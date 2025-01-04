import { Controller, OnStart } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import { UiController } from "./uiController";
import { gameConstants } from "shared/constants";
import ReactRoblox from "@rbxts/react-roblox";
import React from "@rbxts/react";
import TypewriterBillboard from "client/reactComponents/typeWritingBillboard";

@Controller({})
export class ShopController implements OnStart {
	constructor(private readonly uiController: UiController) {}

	onStart() {
		const PROMPT_DIALOGS = {
			[gameConstants.SELL_UI]: "hey there! you can sell your treasures here",
			[gameConstants.SHOP_UI]: "what would you like to buy?",
		};

		const createShopPrompt = (part: BasePart, shopType: string) => {
			// Create a prompt that will open the sell ui when triggered
			const prompt = new Instance("ProximityPrompt");
			prompt.ActionText = "Open";
			prompt.ObjectText = part.Name;
			prompt.RequiresLineOfSight = false;
			prompt.Parent = part;

			const newUiFolder = new Instance("Folder");
			newUiFolder.Name = "DialogBillboard";
			newUiFolder.Parent = part;

			const dialogRoot = ReactRoblox.createRoot(newUiFolder);

			prompt.Triggered.Connect(() => {
				prompt.Enabled = false;
				dialogRoot.render(
					React.createElement(TypewriterBillboard, {
						text: PROMPT_DIALOGS[shopType],
						resetTrigger: tick(),
						typingSpeed: 20,
						part,
						onFinish: () => {
							task.wait(1);
							prompt.Enabled = true;
							this.uiController.toggleUi(shopType);
						},
					}),
				);
			});
		};

		for (const sellPart of CollectionService.GetTagged("Sell")) {
			if (!sellPart.IsA("BasePart")) continue;
			createShopPrompt(sellPart, gameConstants.SELL_UI);
		}

		for (const shopPart of CollectionService.GetTagged("Shop")) {
			if (!shopPart.IsA("BasePart")) continue;
			createShopPrompt(shopPart, gameConstants.SHOP_UI);
		}

		CollectionService.GetInstanceAddedSignal("Shop").Connect((shopPart) => {
			if (!shopPart.IsA("BasePart")) return;
			createShopPrompt(shopPart, gameConstants.SHOP_UI);
		});

		CollectionService.GetInstanceAddedSignal("Sell").Connect((sellPart) => {
			if (!sellPart.IsA("BasePart")) return;
			createShopPrompt(sellPart, gameConstants.SELL_UI);
		});
	}
}
