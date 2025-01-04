import Signal from "@rbxts/goodsignal";

export const Signals = {
	dig: new Signal<() => void>(),
	updateDiggingProgress: new Signal<(progress: number, maxProgress: number) => void>(),
	detectorInitialized: new Signal<(player: Player, detector: Tool) => void>(),
	addMoney: new Signal<(player: Player, amount: number) => void>(),
};
