import Signal from "@rbxts/goodsignal";
import { Item, ItemName, ItemType } from "shared/networkTypes";

export = {
	giveItem: new Signal<(player: Player, itemType: ItemType, itemName: ItemName) => void>(),
};
