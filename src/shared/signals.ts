import Signal from "@rbxts/goodsignal";
import { Target } from "./networkTypes";

export const Signals = {
	updateDiggingProgress: new Signal<(progress: number, maxProgress: number) => void>(),
	detectorInitialized: new Signal<(player: Player, detector: Tool) => void>(),
	addMoney: new Signal<(player: Player, amount: number) => void>(),
	resetSkills: new Signal<(player: Player) => void>(),
	giveMultiDig: new Signal<(player: Player) => void>(),
	buyServerLuckMultiplier: new Signal<(player: Player) => void>(),
	/** Used to circumvent a cyclical dependency on TargetService->DetectorService<- */
	startDigging: new Signal<(player: Player, target: Target) => void>(),

	// Client only signals:
	autoDig: new Signal<() => void>(),
	dig: new Signal<() => void>(),
	forceSetAutoDigging: new Signal<(enabled: boolean) => void>(),
	setAutoDiggingEnabled: new Signal<(enabled: boolean) => void>(),
	setAutoDiggingRunning: new Signal<(running: boolean) => void>(),
	startLuckbar: new Signal(),
	pauseLuckbar: new Signal(),
	closeLuckbar: new Signal(),
};
