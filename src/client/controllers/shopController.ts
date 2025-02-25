//!optimize 2
//!native
import { Controller, OnRender, OnStart } from "@flamework/core";
import { CollectionService, Players, ReplicatedStorage, TweenService } from "@rbxts/services";
import { UiController } from "./uiController";
import { gameConstants } from "shared/constants";
import ReactRoblox from "@rbxts/react-roblox";
import React from "@rbxts/react";
import TypewriterBillboard from "client/reactComponents/typeWritingBillboard";
import { Events } from "client/network";
import { ItemType } from "shared/networkTypes";
import Object from "@rbxts/object-utils";

const NPC_TAG = "NPC";

let currentOpenMenu: string | undefined;
const registeredShops = new Set<Instance>();
@Controller({})
export class ShopController implements OnStart, OnRender {
	constructor(private readonly uiController: UiController) {}

	onStart() {
		const PROMPT_DIALOGS = {
			[gameConstants.SELL_UI]: "hey there! you can sell your treasures here",
			[gameConstants.SHOP_UI]: "what would you like to buy?",
			[gameConstants.BOAT_SHOP_UI]: "yar matey!",
		} as Record<string, string>;

		const dialogPlayed = Object.keys(PROMPT_DIALOGS).reduce((acc, key) => {
			acc[key] = false;
			return acc;
		}, {} as Record<keyof typeof PROMPT_DIALOGS, boolean>);

		const AnimationFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");

		const createShopPrompt = (part: BasePart, shopType: keyof typeof PROMPT_DIALOGS) => {
			if (registeredShops.has(part)) return;
			// Create a prompt that will open the sell ui when triggered
			const prompt = new Instance("ProximityPrompt");
			prompt.ActionText = "Open";
			prompt.ObjectText = part.Name;
			prompt.RequiresLineOfSight = false;
			prompt.HoldDuration = 0;
			prompt.Style = Enum.ProximityPromptStyle.Custom;
			prompt.MaxActivationDistance = gameConstants.SHOP_PROMPT_RANGE;
			prompt.Parent = part;

			const newUiFolder = new Instance("Folder");
			newUiFolder.Name = "DialogBillboard";
			newUiFolder.Parent = part;

			const dialogRoot = ReactRoblox.createRoot(newUiFolder);

			const npcObject = part.FindFirstChild("NPC") as ObjectValue | undefined;

			if (npcObject && npcObject.Value) {
				const npc = npcObject.Value;
				const highlight = new Instance("Highlight");
				highlight.Name = "Highlight";
				highlight.DepthMode = Enum.HighlightDepthMode.Occluded;
				highlight.FillColor = Color3.fromRGB(255, 255, 255);
				highlight.FillTransparency = 1;
				highlight.Adornee = npc;
				highlight.OutlineTransparency = 1;
				highlight.Parent = npc;

				const humanoid = npc.WaitForChild("Humanoid");
				if (!humanoid) return;
				let animator = humanoid.WaitForChild("Animator") as Animator | undefined;
				if (!animator) {
					animator = new Instance("Animator");
					animator.Parent = humanoid;
				}

				const idleAnimName = shopType === gameConstants.BOAT_SHOP_UI ? "NpcIdleBoat" : "NpcIdleStore";

				const idleAnim = AnimationFolder?.FindFirstChild(idleAnimName) as Animation;
				assert(idleAnim, `Could not find animation ${idleAnimName}`);
				const idleTrack = animator.LoadAnimation(idleAnim);
				idleTrack.Priority = Enum.AnimationPriority.Idle;
				idleTrack.Looped = true;
				idleTrack.Play();

				CollectionService.AddTag(npc, NPC_TAG);

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

				const talkAnimName = shopType === gameConstants.BOAT_SHOP_UI ? "NpcTalkBoat" : "NpcTalkStore";

				const talkAnim = AnimationFolder?.FindFirstChild(talkAnimName) as Animation | undefined;
				assert(talkAnim, `Could not find animation ${talkAnimName}`);
				const talkTrack = animator.LoadAnimation(talkAnim);
				talkTrack.Priority = Enum.AnimationPriority.Action;
				talkTrack.Looped = false;

				prompt.Triggered.Connect(() => {
					prompt.Enabled = false;
					talkTrack.Play();
					currentOpenMenu = shopType;
					if (dialogPlayed[shopType]) {
						prompt.Enabled = true;
						this.uiController.toggleUi(shopType as string);
						return;
					}
					dialogRoot.render(
						React.createElement(TypewriterBillboard, {
							text: PROMPT_DIALOGS[shopType],
							resetTrigger: tick(),
							typingSpeed: 50,
							part,
							onFinish: () => {
								task.wait(0.5);
								dialogRoot.unmount();
								prompt.Enabled = true;
								dialogPlayed[shopType] = true;
								this.uiController.toggleUi(shopType as string);
							},
						}),
					);
				});

				registeredShops.add(part);
			}
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

		Events.purchaseFailed.connect((itemType: ItemType) => {
			const nearestNPC = this.getNearestNPC();
			if (!nearestNPC) return;
			const humanoid = nearestNPC.FindFirstChildOfClass("Humanoid");
			if (!humanoid) return;
			let animator = humanoid.FindFirstChild("Animator") as Animator | undefined;
			if (!animator) {
				animator = new Instance("Animator");
				animator.Parent = humanoid;
			}

			const animationName = itemType === "Boats" ? "PurchaseFailedBoat" : "PurchaseFailedStore";

			const animation = AnimationFolder?.FindFirstChild(animationName) as Animation | undefined;
			assert(animation, `Could not find animation ${animationName}`);
			const track = animator.LoadAnimation(animation);
			track.Priority = Enum.AnimationPriority.Action2;
			track.Looped = false;
			task.defer(() => track.Play());
			track.Stopped.Connect(() => {
				track.Destroy();
			});
		});

		Events.boughtItem.connect((_, itemType: ItemType) => {
			const nearestNPC = this.getNearestNPC();
			if (!nearestNPC) return;
			const humanoid = nearestNPC.FindFirstChildOfClass("Humanoid");
			if (!humanoid) return;
			let animator = humanoid.FindFirstChild("Animator") as Animator | undefined;
			if (!animator) {
				animator = new Instance("Animator");
				animator.Parent = humanoid;
			}

			const animationName = itemType === "Boats" ? "BoatGuyBought" : "StoreGuyBought";

			const animation = AnimationFolder?.FindFirstChild(animationName) as Animation | undefined;
			assert(animation, `Could not find animation ${animationName}`);
			const track = animator.LoadAnimation(animation);
			track.Priority = Enum.AnimationPriority.Action2;
			track.Looped = false;
			task.defer(() => track.Play());
			track.Stopped.Connect(() => {
				track.Destroy();
			});
		});
	}

	onRender(): void {
		if (currentOpenMenu) {
			const character = Players.LocalPlayer?.Character;
			if (!character) return;
			const position = character.GetPivot().Position;
			const nearestNPC = this.getNearestNPC();
			if (
				nearestNPC &&
				nearestNPC.GetPivot().Position.sub(position).Magnitude > gameConstants.SHOP_PROMPT_RANGE * 1.2
			) {
				this.uiController.closeUi(currentOpenMenu);
				currentOpenMenu = undefined;
			}
		}
	}

	getNearestNPC() {
		const player = Players.LocalPlayer;
		if (!player) return;
		const pos = player.Character?.GetPivot().Position;
		if (!pos) return;

		let nearestNPC: Model | undefined;
		let nearestDistance = math.huge;

		for (const npcModel of CollectionService.GetTagged(NPC_TAG)) {
			if (!npcModel.IsA("Model")) continue;
			const distance = npcModel.GetPivot().Position.sub(pos).Magnitude;
			if (distance < nearestDistance) {
				nearestNPC = npcModel;
				nearestDistance = distance;
			}
		}

		return nearestNPC;
	}
}
