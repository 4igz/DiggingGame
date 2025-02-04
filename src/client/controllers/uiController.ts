import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Players, StarterGui } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { DiggingBar } from "client/reactComponents/diggingBar";
import { GamepassShopComponent } from "client/reactComponents/gamepassShop";
import LuckBar from "client/reactComponents/luckBar";
import { MainUi } from "client/reactComponents/mainUi";
import { RightSideMenu } from "client/reactComponents/rightSideMenu";
import { Sell } from "client/reactComponents/sell";
import { ShopComponent } from "client/reactComponents/shop";
import { Sidebar } from "client/reactComponents/sidebar";
import DistanceLabel from "client/reactComponents/targetCompass";
import { Toolbar } from "client/reactComponents/toolbar";
import { gameConstants } from "shared/constants";
import { PlayerDigInfo, Target } from "shared/networkTypes";
import { AutoDigging } from "./autoDigController";
import { ItemAddedPopup } from "client/reactComponents/itemAddedPopup";
import { IsleEnterPopup } from "client/reactComponents/isleEnterPopup";
import { ZoneController } from "./zoneController";
import { Signals } from "shared/signals";
import { BoatShopComponent } from "client/reactComponents/boatShop";
import { Popups } from "client/reactComponents/popups";
import { ShovelController } from "./shovelController";

@Controller({})
export class UiController implements OnStart {
	private menus: Map<string, { root: ReactRoblox.Root; element: React.Element; props: object }> = new Map();
	private currentOpenUi: string | undefined;
	private diggingBarActive = false; // We create this, so that we can cancel any active digging bar if we open another UI.
	private autoDiggingEnabled = false;

	constructor(
		private readonly autoDigging: AutoDigging,
		private readonly zoneController: ZoneController,
		private readonly shovelController: ShovelController,
	) {
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
			React.createElement(MainUi),
			{ uiController: this, visible: false },
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
		this.registerUi(gameConstants.POPUP_UI, React.createElement(Popups), {});
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
	}

	onStart() {
		Events.beginDigging.connect((target: Target, digInfo: PlayerDigInfo) => {
			this.toggleUi(gameConstants.DIG_BAR_UI, { target, digInfo });
			this.diggingBarActive = true;
		});

		Events.endDiggingServer.connect(() => {
			this.closeUi(gameConstants.DIG_BAR_UI);
			this.diggingBarActive = false;
		});

		Signals.setAutoDiggingEnabled.Connect((enabled) => {
			this.autoDiggingEnabled = enabled;
		});

		// This sound script hooks up default (hover, click) ui sounds to all buttons and guis alike.
		const soundScript = Players.LocalPlayer.WaitForChild("PlayerScripts").WaitForChild("Sounds") as LocalScript;
		soundScript.Enabled = true;
	}

	public getOpenMenu() {
		return this.currentOpenUi;
	}

	/**
	 * Toggle the visibility of a UI by name.
	 * Special handling for DIG_BAR_UI if autoDiggingEnabled is true.
	 */
	public toggleUi(name: string, newProps: Partial<Record<string, unknown>> = {}) {
		// If we are toggling the DIG_BAR_UI:
		if (name === gameConstants.DIG_BAR_UI) {
			// Check if digBar is currently open
			if (this.diggingBarActive) {
				// If it's open, toggle it off
				this.closeUi(gameConstants.DIG_BAR_UI);
				return;
			} else {
				// We want to open the dig bar
				// If autoDigging is NOT enabled, close current UI first
				if (!this.autoDiggingEnabled && this.currentOpenUi) {
					this.closeUi(this.currentOpenUi);
				}
				// Now open the dig bar without overriding `currentOpenUi`
				this.diggingBarActive = true;
				this.updateUiProps(name, { visible: true, ...newProps });
				return;
			}
		}

		// If we get here, we're toggling a "normal" UI (not the dig bar)
		if (this.currentOpenUi === name) {
			// If it's already open, close it
			this.closeUi(name);
			return;
		} else {
			// Opening a new normal UI
			// Close the old normal UI if one exists
			if (this.currentOpenUi !== undefined) {
				this.closeUi(this.currentOpenUi);
			}
			// If dig bar is open but autoDigging is disabled, close the dig bar
			if (this.diggingBarActive && !this.autoDiggingEnabled) {
				this.closeUi(gameConstants.DIG_BAR_UI);
			}

			// Open the new UI
			this.currentOpenUi = name;
			this.updateUiProps(name, { visible: true, ...newProps });
		}
	}

	public closeUi(name: string) {
		const menu = this.menus.get(name);
		if (!menu) return;

		this.updateUiProps(name, { visible: false });

		// If we're closing the dig bar, update `digBarOpen`
		if (name === gameConstants.DIG_BAR_UI) {
			this.diggingBarActive = false;
			return;
		}

		// Otherwise, if the UI we're closing is the current one, clear it
		if (this.currentOpenUi === name) {
			this.currentOpenUi = undefined;
		}
	}

	public registerUi<T extends object>(
		name: string,
		component: React.FunctionComponentElement<T>,
		initialProps: T,
		ignoreGuiInset = false,
		useSibling = false,
	) {
		const root = this.newUiRoot(name, ignoreGuiInset, useSibling);
		this.menus.set(name, { element: component, root, props: initialProps });
		root.render(React.cloneElement(component, { ...initialProps, uiController: this }));
	}

	public updateUiProps(name: string, newProps: any) {
		const menu = this.menus.get(name);
		if (menu) {
			if (typeOf(menu.props) === "table" && typeOf(newProps) === "table") {
				menu.props = { ...menu.props, ...newProps };
			} else {
				warn("menu.props or newProps is not an object");
			}
			menu.root.render(React.cloneElement(menu.element, menu.props as Partial<any> & React.Attributes));
		}
	}

	public newUiRoot(name: string, ignoreGuiInset = false, useSibling = false) {
		const uiRoot = new Instance("ScreenGui");
		uiRoot.IgnoreGuiInset = ignoreGuiInset;
		if (useSibling) {
			uiRoot.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
		}
		uiRoot.ResetOnSpawn = false;
		uiRoot.Name = `react_${name}`;
		uiRoot.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");

		const root = ReactRoblox.createRoot(uiRoot);
		return root;
	}
}
