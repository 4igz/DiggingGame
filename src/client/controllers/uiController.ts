//!optimize 2
//!native
import { Controller, OnInit, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { HttpService, Players, ReplicatedStorage, RunService, StarterGui, StarterPlayer } from "@rbxts/services";
import { Events } from "client/network";
import { DiggingBar } from "client/reactComponents/diggingBar";
import { GamepassShopComponent } from "client/reactComponents/gamepassShop";
import LuckBar from "client/reactComponents/luckBar";
import { InventoryComponent } from "client/reactComponents/inventory";
import { RightSideMenu } from "client/reactComponents/rightSideMenu";
import { Sell } from "client/reactComponents/sell";
import { ShopComponent } from "client/reactComponents/shop";
import { Sidebar } from "client/reactComponents/sidebar";
import DistanceLabel from "client/reactComponents/targetCompass";
import { Toolbar } from "client/reactComponents/toolbar";
import { gameConstants } from "shared/constants";
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

const menus: Map<string, { root: ReactRoblox.Root; element: React.Element; props: object }> = new Map();
let currentOpenUi: string | undefined;
let diggingBarActive = false; // We create this, so that we can cancel any active digging bar if we open another UI.
let autoDiggingEnabled = false;
let uiGuid = HttpService.GenerateGUID(false);

@Controller({
	loadOrder: 0,
})
export class UiController implements OnStart, OnInit {
	constructor(
		private readonly autoDigging: AutoDigging,
		private readonly zoneController: ZoneController,
		private readonly shovelController: ShovelController,
		private readonly gamepassController: GamepassController,
	) {}

	onStart(): void | Promise<void> {
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

		this.registerUi(
			gameConstants.DIG_BAR_UI,
			React.createElement(DiggingBar),
			{
				visible: false,
				shovelController: this.shovelController,
			},
			false,
			true,
		);
		this.registerUi(gameConstants.RIGHT_SIDE_HUD, React.createElement(RightSideMenu), { uiController: this }, true);
		this.registerUi(gameConstants.LUCKBAR_UI, React.createElement(LuckBar), { visible: false });
		this.registerUi(gameConstants.SIDEBAR_UI, React.createElement(Sidebar), {
			uiController: this,
			autoDigController: this.autoDigging,
		});
		this.registerUi(
			gameConstants.MAIN_UI,
			React.createElement(InventoryComponent),
			{ uiController: this, gamepassController: this.gamepassController, visible: false },
			true,
			true,
		);
		this.registerUi(gameConstants.TOOLBAR_UI, React.createElement(Toolbar), {});
		this.registerUi(
			gameConstants.SELL_UI,
			React.createElement(Sell),
			{ visible: false, uiController: this },
			false,
			true,
		);
		this.registerUi(gameConstants.COMPASS_UI, React.createElement(DistanceLabel), {}, true);
		this.registerUi(
			gameConstants.SHOP_UI,
			React.createElement(ShopComponent),
			{ visible: false, uiController: this },
			false,
			true,
		);
		this.registerUi(
			gameConstants.GAMEPASS_SHOP_UI,
			React.createElement(GamepassShopComponent),
			{
				visible: false,
				uiController: this,
			},
			true,
			true,
		);
		this.registerUi(gameConstants.POPUP_UI, React.createElement(Popups), {}, false, true, 1);
		this.registerUi(
			gameConstants.ISLE_POPUP_UI,
			React.createElement(IsleEnterPopup),
			{
				zoneController: this.zoneController,
			},
			true,
		);
		this.registerUi(
			gameConstants.BOAT_SHOP_UI,
			React.createElement(BoatShopComponent),
			{
				visible: false,
				uiController: this,
			},
			false,
			true,
		);

		this.registerUi("VolumeControl", React.createElement(VolumeMuteButton), {});
		this.registerUi(gameConstants.DIALOG_PROMPT, React.createElement(DialogResponseComponent), {});
		this.registerUi(gameConstants.DAILY_REWARD_UI, React.createElement(DailyRewards), {
			visible: false,
			uiController: this,
		});
		this.registerUi(gameConstants.PLAYTIME_REWARD_UI, React.createElement(PlaytimeRewardsUi), {
			visible: false,
			uiController: this,
		});

		// This sound script hooks up default (hover, click) ui sounds to all buttons and guis alike.
		const soundScript = Players.LocalPlayer.WaitForChild("PlayerScripts").WaitForChild("Sounds") as LocalScript;
		soundScript.Enabled = true;
	}

	/**
	 * Toggle the visibility of a UI by name.
	 * Special handling for DIG_BAR_UI if autoDiggingEnabled is true.
	 */
	public toggleUi(name: string, newProps: Partial<Record<string, unknown>> = {}) {
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
				if (!autoDiggingEnabled && currentOpenUi) {
					this.closeUi(currentOpenUi);
				}
				// Now open the dig bar without overriding `currentOpenUi`
				diggingBarActive = true;
				this.updateUiProps(name, { visible: true, ...newProps });
				return;
			}
		}

		// If we get here, we're toggling a "normal" UI (not the dig bar)
		if (currentOpenUi === name) {
			// If it's already open, close it
			this.closeUi(name);
			return;
		} else {
			// Opening a new normal UI
			// Close the old normal UI if one exists
			if (currentOpenUi !== undefined) {
				this.closeUi(currentOpenUi);
			}
			// If dig bar is open but autoDigging is disabled, close the dig bar
			if (diggingBarActive && !autoDiggingEnabled) {
				this.closeUi(gameConstants.DIG_BAR_UI);
			}

			// Open the new UI
			currentOpenUi = name;
			this.updateUiProps(name, { visible: true, ...newProps });
		}
	}

	public closeUi(name: string) {
		const menu = menus.get(name);
		if (!menu) return;

		this.updateUiProps(name, { visible: false });

		// If we're closing the dig bar, update `digBarOpen`
		if (name === gameConstants.DIG_BAR_UI) {
			diggingBarActive = false;
			return;
		}

		// Otherwise, if the UI we're closing is the current one, clear it
		if (currentOpenUi === name) {
			currentOpenUi = undefined;
		}
	}

	public registerUi<T extends object>(
		name: string,
		component: React.FunctionComponentElement<T>,
		initialProps: T,
		ignoreGuiInset = false,
		useSibling = false,
		displayOrder?: number,
	) {
		const root = this.newUiRoot(name, ignoreGuiInset, useSibling, displayOrder);
		menus.set(name, { element: component, root, props: initialProps });
		root.render(React.cloneElement(component, { ...initialProps, uiController: this }));
	}

	public updateUiProps(name: string, newProps: any) {
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

	public newUiRoot(name: string, ignoreGuiInset = false, useSibling = false, displayOrder: number = 0) {
		const uiRoot = new Instance("ScreenGui");
		uiRoot.IgnoreGuiInset = ignoreGuiInset;
		uiRoot.DisplayOrder = displayOrder;
		if (useSibling) {
			uiRoot.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
		}
		uiRoot.ResetOnSpawn = false;
		uiRoot.Name = `react_${name}`;
		uiRoot.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");

		if (!RunService.IsStudio()) {
			uiRoot.Name = uiGuid;

			uiRoot.DescendantAdded.Connect((descendant) => {
				descendant.Name = uiGuid;
			});
		}

		const root = ReactRoblox.createRoot(uiRoot);
		return root;
	}

	// Hide some stuff from the client that we already have cached.
	// By the time we init here, all modules have been loaded already, so we can safely remove them.
	onInit(): void | Promise<void> {
		task.spawn(() => {
			const uid = HttpService.GenerateGUID(false);
			Players.LocalPlayer.WaitForChild("PlayerScripts")
				.WaitForChild("TS")
				.GetDescendants()
				.forEach((child) => {
					// Can't destroy the runtime script
					if (child.IsA("LocalScript")) return;
					child.Name = uid;
					child.Destroy();
				});

			const ts = StarterPlayer.WaitForChild("StarterPlayerScripts").WaitForChild("TS");
			ts.GetDescendants().forEach((child) => {
				if (child.IsA("LocalScript")) return;
				child.Name = uid;
				child.Destroy();
			});

			const tsShared = ReplicatedStorage.WaitForChild("TS");
			tsShared.GetDescendants().forEach((child) => {
				child.Name = uid;
				child.Destroy();
			});
			tsShared.Destroy();
		});
	}
}
