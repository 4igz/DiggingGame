//!optimize 2
import { Controller, OnInit, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import {
	CollectionService,
	GuiService,
	Players,
	ReplicatedStorage,
	RunService,
	StarterGui,
	StarterPlayer,
	TweenService,
	Workspace,
} from "@rbxts/services";
import { Events } from "client/network";
import { DiggingBar } from "client/reactComponents/diggingBar";
import { GamepassShop } from "client/reactComponents/gamepassShop";
import LuckBar from "client/reactComponents/luckBar";
import { InventoryComponent } from "client/reactComponents/inventory";
import { RightSideMenu } from "client/reactComponents/rightSideMenu";
import { Sell } from "client/reactComponents/sell";
import { ShopComponent } from "client/reactComponents/shop";
import { Sidebar } from "client/reactComponents/sidebar";
import DistanceLabel from "client/reactComponents/targetCompass";
import { Toolbar } from "client/reactComponents/toolbar";
import { gameConstants } from "shared/gameConstants";
import { AutoDigging } from "./autoDigController";
import { IsleEnterPopup } from "client/reactComponents/isleEnterPopup";
import { ZoneController } from "./zoneController";
import { Signals } from "shared/signals";
import { BoatShopComponent } from "client/reactComponents/boatShop";
import { Popups } from "client/reactComponents/popups";
import { ShovelController } from "./shovelController";
import { DailyRewards } from "client/reactComponents/dailyReward";
import { VolumeMuteButton } from "client/reactComponents/volumeMuteButton";
import { GamepassController } from "./gamepassController";
import { PlaytimeRewardsUi } from "client/reactComponents/playTimeRewards";
import { DialogResponseComponent } from "client/reactComponents/dialogResponse";
import { randomString } from "shared/util/nameUtil";
import { debugWarn } from "shared/util/logUtil";
import { ClickEffectContainer } from "client/reactComponents/clickEffect";
import { DetectorHint } from "client/reactComponents/detectorHint";
import { NoYield } from "@rbxts/thread-utilities";
import { QuestInfoSideButton } from "client/reactComponents/questInfoSidebutton";
import { BottomTips } from "client/reactComponents/bottomTips";
import { Zone } from "@rbxts/zone-plus";
import { FreeReward } from "client/reactComponents/freeReward";
import { PackPopup } from "client/reactComponents/packPopup";
import { StarterPackFrame } from "client/reactComponents/starterPackFrame";
import { BottomRightButtons } from "client/reactComponents/bottomRightButtons";
import { HoldToDetectText } from "client/reactComponents/holdToDetectText";

const LOW_LAYER = 0;
const MENU_LAYER = 1;
const OVERLAY_LAYER = 2;

type LayerOrder = typeof LOW_LAYER | typeof MENU_LAYER | typeof OVERLAY_LAYER;

const menus: Map<
	string,
	{ root: ReactRoblox.Root; element: React.Element; props: object; layer: LayerOrder; gui: ScreenGui }
> = new Map();
let diggingBarActive = false; // We create this, so that we can cancel any active digging bar if we open another UI.
let autoDiggingEnabled = false;
math.randomseed(tick());
const uiGuid = randomString(math.random(32, 64));
let effectsActive = false;

const blurEffect = new Instance("BlurEffect");
blurEffect.Size = 0;
blurEffect.Name = "MenuBlur";
blurEffect.Parent = game.GetService("Lighting");
const TARGET_BLUR_SZ = 24;

const camera = Workspace.CurrentCamera!;

const DEFAULT_FOV = camera.FieldOfView;
const MENU_TARGET_FOV = 60;

const EFFECTS_TWEEN_INFO = new TweenInfo(0.1, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut);

@Controller({
	loadOrder: 0,
})
export default class UiController implements OnStart, OnInit {
	public currentOpenUi: string | undefined;

	constructor(
		private readonly autoDigging: AutoDigging,
		private readonly zoneController: ZoneController,
		private readonly shovelController: ShovelController,
		private readonly gamepassController: GamepassController,
	) {}

	/**
	 * Toggle the visibility of a UI by name.
	 * Special handling for DIG_BAR_UI if autoDiggingEnabled is true.
	 */
	public toggleUi(
		name: string,
		newProps: Partial<Record<string, unknown>> = {},
		closeIfAlreadyToggled: boolean = true,
	) {
		const menu = menus.get(name);
		if (!menu) return;

		// If we are toggling the DIG_BAR_UI:
		if (name === gameConstants.DIG_BAR_UI) {
			// Check if digBar is currently open
			if (diggingBarActive) {
				// If it's open, toggle it off
				this.closeUi(gameConstants.DIG_BAR_UI);
				return;
			} else {
				// We want to open the dig bar
				// If autoDigging is NOT enabled, close current UI first
				if (!autoDiggingEnabled && this.currentOpenUi) {
					this.closeUi(this.currentOpenUi);
				}
				// Now open the dig bar without overriding `this.currentOpenUi`
				diggingBarActive = true;
				this.updateUiProps(name, { resetTrigger: tick(), visible: true, ...newProps });
				return;
			}
		}

		// If we get here, we're toggling a "normal" UI (not the dig bar)
		if (this.currentOpenUi === name && closeIfAlreadyToggled) {
			// If it's already open, close it
			this.closeUi(name);
		} else {
			// Opening a new normal UI
			// Close the old normal UI if one exists
			if (this.currentOpenUi !== undefined) {
				this.closeUi(this.currentOpenUi);
			}
			// If dig bar is open but autoDigging is disabled, close the dig bar
			if (diggingBarActive && !autoDiggingEnabled) {
				this.closeUi(gameConstants.DIG_BAR_UI);
			}

			menu.gui.Enabled = true;
			this.currentOpenUi = name;
			this.updateUiProps(name, { resetTrigger: tick(), visible: true, ...newProps });

			// MenuBlur and FOV effects on MENU_LAYER UIs
			if (menu.layer === MENU_LAYER) {
				Signals.menuOpened.Fire(true, name);
			}
		}
	}

	public isMenuLayerOpen() {
		const menu = menus.get(this.currentOpenUi!);
		if (!menu) return false;
		return menu.layer === MENU_LAYER;
	}

	public setGuiEnabled(name: string, visible: boolean) {
		const menu = menus.get(name);
		if (!menu) return;
		menu.gui.Enabled = visible;
	}

	public closeUi(name: string) {
		const menu = menus.get(name);
		if (!menu) return;

		this.updateUiProps(name, { visible: false });

		// Undo blur and FOV effects on close
		if (effectsActive && menu.layer === MENU_LAYER) {
			Signals.menuOpened.Fire(false, name);
		}

		// If we're closing the dig bar, update `digBarOpen`
		if (name === gameConstants.DIG_BAR_UI) {
			diggingBarActive = false;
			return;
		}

		// Otherwise, if the UI we're closing is the current one, clear it
		if (this.currentOpenUi === name) {
			menu.gui.Enabled = false;
			this.currentOpenUi = undefined;
		}
	}

	public registerUi<T extends object>(
		name: string,
		component: React.FunctionComponentElement<T>,
		initialProps: T,
		ignoreGuiInset = false,
		useSibling = false,
		displayOrder?: LayerOrder,
	) {
		const [root, gui] = this.newUiRoot(name, ignoreGuiInset, useSibling, displayOrder);
		menus.set(name, { element: component, root, props: initialProps, layer: displayOrder ?? LOW_LAYER, gui });
		task.spawn(() => {
			// Can be expensive, so set it on its own thread while we continue with the next code
			debug.setmemorycategory(`React Ui: ${name}`);
			debug.profilebegin(`React Ui: ${name}`);
			root.render(React.cloneElement(component, { ...initialProps, uiController: this }));
			debug.profileend();
			debug.resetmemorycategory();
		});
		if ("visible" in initialProps) {
			if (initialProps.visible === true) {
				task.defer(() => (gui.Enabled = true));
			}
		} else {
			task.defer(() => (gui.Enabled = true));
		}
	}

	public updateUiProps(name: string, newProps: object) {
		const menu = menus.get(name);
		if (menu) {
			if (typeOf(menu.props) === "table" && typeOf(newProps) === "table") {
				menu.props = { ...menu.props, ...newProps };
			} else {
				warn("menu.props or newProps is not an object");
			}
			menu.root.render(React.cloneElement(menu.element, menu.props as Partial<any> & React.Attributes));
		}
	}

	public newUiRoot(
		name: string,
		ignoreGuiInset = false,
		useSibling = false,
		displayOrder: number = 0,
	): [ReactRoblox.Root, ScreenGui] {
		const screenGui = new Instance("ScreenGui");
		screenGui.IgnoreGuiInset = ignoreGuiInset;
		screenGui.DisplayOrder = displayOrder;
		if (useSibling) {
			screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
		}
		screenGui.ResetOnSpawn = false;
		screenGui.Name = `react_${name}`;
		screenGui.Enabled = false;
		screenGui.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");

		if (!RunService.IsStudio()) {
			screenGui.Name = uiGuid;

			screenGui.DescendantAdded.Connect((descendant) => {
				descendant.Name = uiGuid;
			});
		}

		const root = ReactRoblox.createRoot(screenGui);
		return [root, screenGui];
	}

	onStart(): void | Promise<void> {
		// This is as far as we need to log, since all `onStart()`s run in parallel.
		// We don't need to log the end of the start lifecycle since we can assume that
		// if we got here, everything is fine leading up to this point.
		debugWarn("Client module onInit lifecycle complete.", "INIT", true);
		debugWarn(
			"Client module onStart lifecycle began.\n------------------------------------------------------------------------------------------------------",
			"INIT",
			true,
		);

		const createGiftUIZone = (inst: PVInstance) => {
			const zone = new Zone(inst);
			zone.localPlayerEntered.Connect(() => {
				if (this.autoDigging.autoDiggingEnabled) return;
				this.toggleUi(gameConstants.FREE_REWARD_UI, {}, false);
			});
		};

		CollectionService.GetTagged("FreeGiftZone").forEach((i) => {
			assert(i.IsA("PVInstance"));
			createGiftUIZone(i);
		});

		CollectionService.GetInstanceAddedSignal("FreeGiftZone").Connect((i) => {
			assert(i.IsA("PVInstance"));
			createGiftUIZone(i);
		});

		Signals.menuOpened.Connect((isOpen, _) => {
			TweenService.Create(camera, EFFECTS_TWEEN_INFO, {
				FieldOfView: isOpen ? MENU_TARGET_FOV : DEFAULT_FOV,
			}).Play();
			TweenService.Create(blurEffect, EFFECTS_TWEEN_INFO, {
				Size: isOpen ? TARGET_BLUR_SZ : 0,
			}).Play();
			effectsActive = isOpen;
		});

		GuiService.MenuOpened.Connect(() => {
			this.closeCurrentOpenMenu();
		});
	}

	toString() {
		return uiGuid;
	}

	public closeCurrentOpenMenu() {
		if (this.currentOpenUi !== undefined) {
			this.closeUi(this.currentOpenUi);
		}
	}

	onInit(): void | Promise<void> {
		debugWarn("Client module onInit lifecycle began.", "INIT", true);

		Events.beginDigging.connect(() => {
			diggingBarActive = true;
		});

		Events.endDiggingServer.connect(() => {
			diggingBarActive = false;
		});

		Signals.setAutoDiggingEnabled.Connect((enabled) => {
			autoDiggingEnabled = enabled;
		});

		StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);
		StarterGui.ScreenOrientation = Enum.ScreenOrientation.LandscapeSensor;

		// @param setProp: Use false if the element sets itself visible
		Signals.setUiToggled.Connect((name: string, uiVisible: boolean, setProp: boolean = true) => {
			this.setGuiEnabled(name, uiVisible);
			if (setProp) {
				this.updateUiProps(name, { visible: uiVisible });
			}
		});

		this.registerUi(
			gameConstants.FREE_REWARD_UI,
			React.createElement(FreeReward),
			{
				visible: false,
				uiController: this,
			},
			undefined,
			true,
			MENU_LAYER,
		);

		this.registerUi(
			gameConstants.DIG_BAR_UI,
			React.createElement(DiggingBar),
			{
				visible: false,
				shovelController: this.shovelController,
				uiController: this,
				gamepassController: this.gamepassController,
			},
			undefined,
			true,
			LOW_LAYER,
		);
		this.registerUi(
			gameConstants.RIGHT_SIDE_HUD,
			React.createElement(RightSideMenu),
			{ uiController: this },
			true,
			true,
			LOW_LAYER,
		);

		this.registerUi(
			gameConstants.LUCKBAR_UI,
			React.createElement(LuckBar),
			{ uiController: this },
			undefined,
			undefined,
			LOW_LAYER,
		);

		this.registerUi(
			gameConstants.SIDEBAR_UI,
			React.createElement(Sidebar),
			{
				uiController: this,
				autoDigController: this.autoDigging,
			},
			true,
			undefined,
			LOW_LAYER,
		);

		this.registerUi(
			gameConstants.MAIN_UI,
			React.createElement(InventoryComponent),
			{ uiController: this, gamepassController: this.gamepassController, visible: false },
			true,
			true,
			MENU_LAYER,
		);

		this.registerUi(gameConstants.TOOLBAR_UI, React.createElement(Toolbar), {});

		this.registerUi(
			gameConstants.SELL_UI,
			React.createElement(Sell),
			{ visible: false, uiController: this },
			undefined,
			true,
			MENU_LAYER,
		);

		this.registerUi(gameConstants.COMPASS_UI, React.createElement(DistanceLabel), {}, true, false, LOW_LAYER);

		this.registerUi(
			gameConstants.SHOP_UI,
			React.createElement(ShopComponent),
			{ visible: false, uiController: this },
			undefined,
			true,
			MENU_LAYER,
		);

		this.registerUi(
			gameConstants.GAMEPASS_SHOP_UI,
			React.createElement(GamepassShop),
			{
				visible: false,
				uiController: this,
				gamepassController: this.gamepassController,
			},
			true,
			true,
			MENU_LAYER,
		);

		this.registerUi(gameConstants.POPUP_UI, React.createElement(Popups), {}, undefined, false, OVERLAY_LAYER);

		this.registerUi(
			gameConstants.ISLE_POPUP_UI,
			React.createElement(IsleEnterPopup),
			{
				zoneController: this.zoneController,
			},
			true,
			undefined,
			OVERLAY_LAYER,
		);

		this.registerUi(
			gameConstants.BOAT_SHOP_UI,
			React.createElement(BoatShopComponent),
			{
				visible: false,
				uiController: this,
			},
			undefined,
			true,
			MENU_LAYER,
		);
		// this.registerUi("VolumeControl", React.createElement(VolumeMuteButton), {}, false, false, LOW_LAYER);
		this.registerUi(
			gameConstants.DIALOG_PROMPT,
			React.createElement(DialogResponseComponent),
			{},
			undefined,
			undefined,
			OVERLAY_LAYER,
		);
		this.registerUi(
			gameConstants.DAILY_REWARD_UI,
			React.createElement(DailyRewards),
			{
				visible: false,
				uiController: this,
			},
			true,
			undefined,
			MENU_LAYER,
		);
		this.registerUi(
			gameConstants.PLAYTIME_REWARD_UI,
			React.createElement(PlaytimeRewardsUi),
			{
				visible: false,
				uiController: this,
			},
			undefined,
			undefined,
			MENU_LAYER,
		);
		this.registerUi(
			"ClickEffect",
			React.createElement(ClickEffectContainer),
			{ shovelController: this.shovelController },
			true,
			undefined,
			OVERLAY_LAYER,
		);
		this.registerUi(
			gameConstants.DETECTOR_HINT_TEXT,
			React.createElement(DetectorHint),
			{ visible: false },
			undefined,
			undefined,
			LOW_LAYER,
		);
		this.registerUi(
			gameConstants.QUEST_INFO_SIDEBUTTON,
			React.createElement(QuestInfoSideButton),
			{ UiController: this },
			undefined,
			undefined,
			LOW_LAYER,
		);

		this.registerUi(
			"BottomTips",
			React.createElement(BottomTips),
			{ uiController: this },
			undefined,
			undefined,
			LOW_LAYER,
		);

		this.registerUi("PackPopup", React.createElement(PackPopup), { uiController: this }, true, true, LOW_LAYER);

		this.registerUi(
			gameConstants.PACK_FRAME_UI,
			React.createElement(StarterPackFrame),
			{ visible: false, gamepassController: this.gamepassController, uiController: this },
			true,
			undefined,
			MENU_LAYER,
		);

		this.registerUi(
			gameConstants.BOTTOM_RIGHT_HUD,
			React.createElement(BottomRightButtons),
			{ uiController: this },
			true,
			true,
			LOW_LAYER,
		);
		this.registerUi("HoldToDetectText", React.createElement(HoldToDetectText), {}, undefined, undefined, LOW_LAYER);

		// // Hide some stuff from the client that we already have cached.
		// // By the time we init here, all modules have been loaded already, so we can safely remove them.
		// // The goal of destroying all the scripts and renaming them to something ambiguous is to make
		// // it harder for exploiters to find modules they're looking for, thus making it harder to exploit the game.
		// //
		// // No, this isn't 100% foolproof, but it's a good deterrent. It will definitely be a pain for anyone trying
		// // to reverse engineer the game to find what they're looking for. Anyone with decent exploiting knowledge will
		// // know how to find these nil'd scripts, but it's a good way to ward off inexperienced or ignorant exploit devs.
		// //
		// // The same guid is used for all destroyed module scripts and UIs to make it harder to distinguish them from each other.
		// //
		// // To my knowledge, the only way to distinguish them is to get their debug id's somehow, which is different per instance,
		// // and then use that to find the instance in nilinstances. But that's a lot of work.
		// //
		// // What they will more likely do is hook the game metatable and prevent ModuleScripts, folders, etc. from being destroyed and renamed.
		// // It does require a decent bit of exploiting knowledge to actually perform this, but it's not impossible, and will be done.
		// // They will probably start by preventing ModuleScripts from being destroyed, but the folders containing the ModuleScripts are also destroyed,
		// // so they will have to figure that out too. Doing this may break the game for them in unintended ways though due to certain CoreScripts doing the same thing.
		// //
		// // However, this is only one of the many layers of "security". They have to get past this first though before they can move further.
		// task.spawn(() => {
		// 	xpcall(() => {
		// 		// Make it harder to hook the game metatable and prevent scripts from being destroyed.
		// 		// This can be bypassed but it will be more difficult.
		// 		// If they try hooking destroying modules with an infinite wait, we'll know they yielded here.
		// 		// If they hook destroying modules or renaming modules to error then we'll know if something went wrong.
		// 		const safeDispose = (instance: Instance) => {
		// 			if (instance === undefined || typeOf(instance) !== "Instance") return;

		// 			// Any infinite yields (or yields past 1 second) will be caught here.
		// 			// If something errors, we'll know that something went wrong.
		// 			//
		// 			// This will never error under normal circumstances. If this actually happens,
		// 			// there is definitely something fishy going on on the client side.
		// 			NoYield(() => {
		// 				// To disable this in studio, set the DoHide attribute to false.
		// 				// It will still happen in game.
		// 				// It's a good idea to leave it enabled to make sure nothing breaks while still in studio!
		// 				if (RunService.IsStudio() && !ReplicatedStorage.GetAttribute("DoHide")) {
		// 					return;
		// 				}

		// 				instance.Name = uiGuid;
		// 				instance.Destroy();

		// 				if (!instance.Parent && instance.Name === uiGuid) {
		// 					// Also check for renames, or ancestry changes. We don't do this outside of this normally!
		// 					// Someone might bypass this by doing getconnections on these signals and disconnecting them.
		// 					// This is as far as we'll go to prevent tampering. If they get past this, they're probably going to get past anything else.
		// 					instance.GetPropertyChangedSignal("Name").Connect(errorHandler);
		// 					instance.AncestryChanged.Connect(errorHandler);
		// 				} else {
		// 					error("Instance was not actually disposed!");
		// 				}
		// 			});
		// 		};

		// 		Players.LocalPlayer.WaitForChild("PlayerScripts")
		// 			.WaitForChild("TS")
		// 			.GetDescendants()
		// 			.forEach((child) => {
		// 				// Can't destroy the runtime script or scripts will stop running.
		// 				if (child.IsA("LocalScript")) return;

		// 				safeDispose(child);
		// 			});

		// 		const ts = StarterPlayer.WaitForChild("StarterPlayerScripts").WaitForChild("TS");
		// 		ts.GetDescendants().forEach((child) => {
		// 			if (child.IsA("LocalScript")) return;
		// 			safeDispose(child);
		// 		});

		// 		const tsShared = ReplicatedStorage.WaitForChild("TS");
		// 		tsShared.GetDescendants().forEach((child) => {
		// 			safeDispose(child);
		// 		});
		// 		safeDispose(tsShared);

		// 		function markSubtree(root: Instance, keepSet: Set<Instance>) {
		// 			const stack = [root];
		// 			while (stack.size() > 0) {
		// 				const current = stack.pop()!;
		// 				if (!keepSet.has(current)) {
		// 					keepSet.add(current);
		// 					for (const child of current.GetChildren()) {
		// 						stack.push(child);
		// 					}
		// 				}
		// 			}
		// 		}

		// 		function markAncestors(instance: Instance, keepSet: Set<Instance>, stopAt: Instance) {
		// 			let current: Instance | undefined = instance;
		// 			while (current) {
		// 				keepSet.add(current);
		// 				if (current === stopAt) break;
		// 				current = current.Parent;
		// 			}
		// 		}

		// 		const includeNames = ["@jsdotlua"];
		// 		const rbxtsInclude = ReplicatedStorage.WaitForChild("rbxts_include");
		// 		const keepSet = new Set<Instance>();
		// 		keepSet.add(rbxtsInclude);
		// 		const allDescendants = rbxtsInclude.GetDescendants();

		// 		for (const descendant of allDescendants) {
		// 			if (includeNames.includes(descendant.Name)) {
		// 				markSubtree(descendant, keepSet);

		// 				markAncestors(descendant, keepSet, rbxtsInclude);
		// 			}
		// 		}

		// 		for (const descendant of allDescendants) {
		// 			if (!keepSet.has(descendant)) {
		// 				safeDispose(descendant);
		// 			}
		// 		}

		// 		ReplicatedStorage.SetAttribute("DoHide", undefined);
		// 	}, errorHandler);
		// });
	}
}

// function errorHandler() {
// 	// If we got here, it's likely that someone is trying to interfere with the game, by erroring when modules are renamed, or
// 	// yielding infinitely to prevent the thread from continuing. This should only happen if the user is trying to exploit the game.
// 	// It's impossible for a normal player to trigger this.
// 	Events.selfReport("Tampering");
// }
