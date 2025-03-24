//!optimize 2
import { atom } from "@rbxts/charm";
import { InventoryItemProps } from "client/reactComponents/inventory";
import { gameConstants } from "shared/gameConstants";

// Essentially global state to keep track of the treasure count between scripts.
export const treasureCountAtom = atom(0);
export const inventorySizeAtom = atom(gameConstants.TARGET_INVENTORY_DEFAULT_CAPACITY);
export const treasureInventoryAtom = atom<Array<InventoryItemProps>>([]);
