import { Controller, OnStart } from "@flamework/core";
import { CollectionService, TweenService } from "@rbxts/services";
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
			[gameConstants.BOAT_SHOP_UI]: "yar matey!",
		};

		const createShopPrompt = (part: BasePart, shopType: keyof typeof PROMPT_DIALOGS) => {
			// Create a prompt that will open the sell ui when triggered
			const prompt = new Instance("ProximityPrompt");
			prompt.ActionText = "Open";
			prompt.ObjectText = part.Name;
			prompt.RequiresLineOfSight = false;
			prompt.HoldDuration = 0;
			prompt.Style = Enum.ProximityPromptStyle.Custom;
			prompt.Parent = part;

			const newUiFolder = new Instance("Folder");
			newUiFolder.Name = "DialogBillboard";
			newUiFolder.Parent = part;

			const dialogRoot = ReactRoblox.createRoot(newUiFolder);

			const npcObject = part.FindFirstChild("NPC") as ObjectValue | undefined;

			if (npcObject && npcObject.Value) {
				const highlight = new Instance("Highlight");
				highlight.Name = "Highlight";
				highlight.DepthMode = Enum.HighlightDepthMode.Occluded;
				highlight.FillColor = Color3.fromRGB(255, 255, 255);
				highlight.FillTransparency = 1;
				highlight.Adornee = npcObject.Value;
				highlight.OutlineTransparency = 1;
				highlight.Parent = npcObject.Value;

				prompt.PromptShown.Connect(() => {
					TweenService.Create(
						highlight,
						new TweenInfo(0.25, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut),
						{ OutlineTransparency: 0 },
					).Play();
				});
				prompt.PromptHidden.Connect(() => {
					TweenService.Create(
						highlight,
						new TweenInfo(0.25, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut),
						{ OutlineTransparency: 1 },
					).Play();
				});
			}

			prompt.Triggered.Connect(() => {
				prompt.Enabled = false;
				dialogRoot.render(
					React.createElement(TypewriterBillboard, {
						text: PROMPT_DIALOGS[shopType],
						resetTrigger: tick(),
						typingSpeed: 50,
						part,
						onFinish: () => {
							task.wait(1);
							prompt.Enabled = true;
							this.uiController.toggleUi(shopType as string);
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

		for (const shopPart of CollectionService.GetTagged("BoatShop")) {
			if (!shopPart.IsA("BasePart")) continue;
			createShopPrompt(shopPart, gameConstants.BOAT_SHOP_UI);
		}

		CollectionService.GetInstanceAddedSignal("BoatShop").Connect((shopPart) => {
			if (!shopPart.IsA("BasePart")) return;
			createShopPrompt(shopPart, gameConstants.BOAT_SHOP_UI);
		});

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
