//!optimize 2
import Signal from "@rbxts/goodsignal";
import { Target } from "./networkTypes";
import { potionConfig } from "./config/potionConfig";

export const Signals = {
	// Server only signals:
	updateDiggingProgress: new Signal<(progress: number, maxProgress: number) => void>(),
	detectorInitialized: new Signal<(player: Player, detector: Tool) => void>(),
	addMoney: new Signal<(player: Player, amount: number) => void>(),
	resetSkills: new Signal<(player: Player) => void>(),
	giveMultiDig: new Signal<(player: Player) => void>(),
	giveLimitedOffer: new Signal<(player: Player, num: 0 | 1 | 2) => void>(),
	buyServerLuckMultiplier: new Signal<(player: Player) => void>(),
	unlockPlaytimeRewards: new Signal<(player: Player) => void>(),
	startDigging: new Signal<(player: Player, target: Target) => void>(),

	// Client only signals:
	requestingNewPather: new Signal<() => void>(),
	gotDigInput: new Signal<() => void>(),
	inventoryFull: new Signal<() => void>(),
	endDigging: new Signal<(diggingComplete: boolean) => void>(),
	autoDig: new Signal<() => void>(),
	setCanDig: new Signal<(canDig: boolean) => void>(),
	clientStartedDigging: new Signal<() => void>(),
	setShovelEquipped: new Signal<(equipped: boolean) => void>(),
	dig: new Signal<() => void>(),
	setDetectorHintEnabled: new Signal<(enabled: boolean) => void>(),
	setUiToggled: new Signal<(name: string, enabled: boolean, setProp: boolean) => void>(),
	setLuckbarVisible: new Signal<(visible: boolean) => void>(),
	forceSetAutoDigging: new Signal<(enabled: boolean) => void>(),
	setAutoDiggingEnabled: new Signal<(enabled: boolean) => void>(),
	setAutoDiggingRunning: new Signal<(running: boolean) => void>(),
	startLuckbar: new Signal(),
	pauseLuckbar: new Signal(),
	closeLuckbar: new Signal(),
	invalidAction: new Signal<(text?: string) => void>(),
	actionPopup: new Signal<(text?: string) => void>(),
	drankPotion: new Signal<(potionName: keyof typeof potionConfig) => void>(),

	menuOpened: new Signal<(isOpen: boolean, menuName: string) => void>(),
};
