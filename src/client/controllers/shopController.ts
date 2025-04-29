//!optimize 2
import { Controller, OnRender, OnStart } from "@flamework/core";
import { CollectionService, Players, ReplicatedStorage, SoundService, TweenService } from "@rbxts/services";
import UiController from "client/controllers/uiController";
import { gameConstants } from "shared/gameConstants";
import ReactRoblox from "@rbxts/react-roblox";
import React from "@rbxts/react";
import TypewriterBillboard from "client/reactComponents/typeWritingBillboard";
import { Events } from "client/network";
import { ItemType } from "shared/networkTypes";
import Object from "@rbxts/object-utils";
import { Signals } from "shared/signals";

const NPC_TAG = "NPC";

let currentOpenMenu: string | undefined;
const registeredShops = new Set<Instance>();
@Controller({})
export class ShopController implements OnStart, OnRender {
	constructor(private readonly uiController: UiController) {}

	onStart() {
		const PROMPT_DIALOGS = {
			[gameConstants.SELL_UI]: "Hey! Sell your treasures here.",
			[gameConstants.SHOP_UI]: "What would you like to buy?",
			[gameConstants.BOAT_SHOP_UI]: "Get yourself a boat!",
		} as Record<string, string>;

		const npcChatter = SoundService.WaitForChild("UI").WaitForChild("NpcChatter");

		const dialogPlayed = Object.keys(PROMPT_DIALOGS).reduce((acc, key) => {
			acc[key] = false;
			return acc;
		}, {} as Record<keyof typeof PROMPT_DIALOGS, boolean>);

		const AnimationFolder = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Animations");

		const animationTracks = new Map<Model, Map<string, AnimationTrack>>();

		const playAnimation = (npc: Model, animationName: string, animationType: "Action" | "Idle") => {
			const humanoid = npc.FindFirstChildOfClass("Humanoid");
			if (!humanoid) return;
			let animator = humanoid.FindFirstChild("Animator") as Animator | undefined;
			if (!animator) {
				animator = new Instance("Animator");
				animator.Parent = humanoid;
			}

			let tracks = animationTracks.get(npc);

			if (!tracks) {
				tracks = animationTracks.set(npc, new Map<string, AnimationTrack>()).get(npc);
			}

			const track = tracks!.get(animationName);
			if (!track) {
				const animation = AnimationFolder?.FindFirstChild(animationName) as Animation | undefined;
				assert(animation, `Could not find animation ${animationName}`);
				const track = animator.LoadAnimation(animation);
				track.Priority =
					animationType === "Action" ? Enum.AnimationPriority.Action : Enum.AnimationPriority.Idle;
				track.Looped = animationType === "Idle";
				track.Play();
				tracks!.set(animationName, track);
			} else {
				track.Play();
			}
			return track;
		};

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
				const npc = npcObject.Value as Model;
				const highlight = new Instance("Highlight");
				highlight.Name = "Highlight";
				highlight.DepthMode = Enum.HighlightDepthMode.Occluded;
				highlight.FillColor = Color3.fromRGB(255, 255, 255);
				highlight.FillTransparency = 1;
				highlight.Adornee = npc;
				highlight.OutlineTransparency = 1;
				highlight.Parent = npc;

				const idleAnimName = shopType === gameConstants.BOAT_SHOP_UI ? "NpcIdleBoat" : "NpcIdleStore";

				playAnimation(npc, idleAnimName, "Idle");

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

				prompt.Triggered.Connect(() => {
					prompt.Enabled = false;
					playAnimation(npc, talkAnimName, "Action");
					SoundService.PlayLocalSound(npcChatter as Sound);
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
			const character = Players.LocalPlayer.Character;
			if (!character) return;
			const [nearestNPC] = this.getNearestNPC(character.GetPivot().Position);
			if (!nearestNPC) return;

			const purchaseFailedAnimationName = itemType === "Boats" ? "PurchaseFailedBoat" : "PurchaseFailedStore";

			playAnimation(nearestNPC, purchaseFailedAnimationName, "Action");
			// SoundService.PlayLocalSound(npcChatter as Sound);
		});

		Events.boughtItem.connect((_, itemType: ItemType) => {
			const character = Players.LocalPlayer.Character;
			if (!character) return;
			const [nearestNPC] = this.getNearestNPC(character.GetPivot().Position);
			if (!nearestNPC) return;
			const humanoid = nearestNPC.FindFirstChildOfClass("Humanoid");
			if (!humanoid) return;
			let animator = humanoid.FindFirstChild("Animator") as Animator | undefined;
			if (!animator) {
				animator = new Instance("Animator");
				animator.Parent = humanoid;
			}

			const animationName = itemType === "Boats" ? "BoatGuyBought" : "StoreGuyBought";

			playAnimation(nearestNPC, animationName, "Action");
			SoundService.PlayLocalSound(SoundService.WaitForChild("UI").WaitForChild("Buy") as Sound);
		});
	}

	onRender(): void {
		if (currentOpenMenu) {
			const character = Players.LocalPlayer.Character;
			if (!character) return;
			const [nearestNPC, distance] = this.getNearestNPC(character.GetPivot().Position);
			if (nearestNPC && distance > gameConstants.SHOP_PROMPT_RANGE * 1.2) {
				this.uiController.closeUi(currentOpenMenu);
				currentOpenMenu = undefined;
			}
		}
	}

	getNearestNPC(position: Vector3) {
		let nearestNPC: Model | undefined;
		let nearestDistance = math.huge;

		for (const npcModel of CollectionService.GetTagged(NPC_TAG)) {
			if (!npcModel.IsA("Model")) continue;
			const distance = npcModel.GetPivot().Position.sub(position).Magnitude;
			if (distance < nearestDistance) {
				nearestNPC = npcModel;
				nearestDistance = distance;
			}
		}

		return [nearestNPC, nearestDistance] as const;
	}
}
