import { atom } from "@rbxts/charm";
import { gameConstants } from "shared/constants";

// Essentially global state to keep track of the treasure count between scripts.
export const treasureCountAtom = atom(0);
export const inventorySizeAtom = atom(gameConstants.TARGET_INVENTORY_DEFAULT_CAPACITY);
