import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Players, StarterGui } from "@rbxts/services";
import { Events, Functions } from "client/network";
import { DiggingBar, DiggingBarProps } from "client/reactComponents/diggingBar";
import LuckBar from "client/reactComponents/luckBar";
import { MainUi } from "client/reactComponents/mainUi";
import { MoneyDisplay } from "client/reactComponents/moneyDisplay";
import { Sell } from "client/reactComponents/sell";
import { ShopComponent } from "client/reactComponents/shop";
import { Sidebar } from "client/reactComponents/sidebar";
import DistanceLabel from "client/reactComponents/targetCompass";
import { Toolbar } from "client/reactComponents/toolbar";
import { gameConstants } from "shared/constants";
import { PlayerDigInfo, Target } from "shared/networkTypes";

@Controller({})
export class UiController implements OnStart {
	private menus: Map<string, { root: ReactRoblox.Root; element: React.Element; props: object }> = new Map();
	private currentOpenUi: string | undefined;
	private diggingBarActive = false; // We create this, so that we can cancel any active digging bar if we open another UI.

	onStart() {
		StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

		this.registerUi(
			gameConstants.DIG_BAR_UI,
			React.createElement(DiggingBar),
			{
				visible: false,
			},
			false,
			true,
		);

		Events.beginDigging.connect((target: Target, digInfo: PlayerDigInfo) => {
			this.toggleUi(gameConstants.DIG_BAR_UI, { target, digInfo });
			this.diggingBarActive = true;
		});

		// TODO: Tell client what they dug up.
		Events.endDiggingServer.connect(() => {
			this.closeUi(gameConstants.DIG_BAR_UI);
			this.diggingBarActive = false;
		});

		Functions.getMoneyShortString.invoke().then((money) => {
			this.registerUi(gameConstants.MONEY_UI, React.createElement(MoneyDisplay), { amount: money });
		});

		this.registerUi(gameConstants.LUCKBAR_UI, React.createElement(LuckBar), { visible: false, paused: false });
		this.registerUi(gameConstants.SIDEBAR_UI, React.createElement(Sidebar), { uiController: this });
		this.registerUi(gameConstants.MAIN_UI, React.createElement(MainUi), { uiController: this, visible: false });
		this.registerUi(gameConstants.TOOLBAR_UI, React.createElement(Toolbar), {});
		this.registerUi(gameConstants.SELL_UI, React.createElement(Sell), { visible: false, uiController: this });
		this.registerUi(gameConstants.COMPASS_UI, React.createElement(DistanceLabel), {});
		this.registerUi(
			gameConstants.SHOP_UI,
			React.createElement(ShopComponent),
			{ visible: false, uiController: this },
			false,
			true,
		);
	}

	public toggleUi(name: string, newProps: Partial<Record<string, unknown>> = {}) {
		if (this.currentOpenUi !== undefined) {
			if (this.diggingBarActive && name !== gameConstants.DIG_BAR_UI) {
				Events.endDiggingClient(); // Also will send a endDigging event back.
			}

			if (this.currentOpenUi === name) {
				this.closeUi(this.currentOpenUi);
				return;
			}

			if (this.currentOpenUi !== "MainMenu") {
				this.closeUi(this.currentOpenUi);
			}
		}

		const menu = this.menus.get(name);
		if (menu) {
			if (typeOf(menu.props) === "table" && typeOf(newProps) === "table") {
				menu.props = { ...menu.props, ...newProps, visible: true, uiController: this };
			} else {
				warn("menu.props or newProps is not an object");
			}
			menu.root.render(React.cloneElement(menu.element, menu.props as Partial<any> & React.Attributes));
			this.currentOpenUi = name;
		}
	}

	public closeUi(name: string) {
		const menu = this.menus.get(name);
		if (menu) {
			this.updateUiProps(name, { visible: false });
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
		uiRoot.Name = name;
		uiRoot.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");

		const root = ReactRoblox.createRoot(uiRoot);
		return root;
	}
}
