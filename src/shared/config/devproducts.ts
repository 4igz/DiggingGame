import { Signals } from "shared/signals";

interface DeveloperProduct {
	id: number;
	name: string;
	grantReward: (player: Player) => void;
}

export const developerProducts: DeveloperProduct[] = [
	{
		id: 2683146655,
		name: "1k Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 1_000);
		},
	},
	{
		id: 2683146887,
		name: "2.5k Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 2_500);
		},
	},
	{
		id: 2683147047,
		name: "7.5k Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 7_500);
		},
	},
	{
		id: 2683147418,
		name: "15k Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 15_000);
		},
	},
	{
		id: 2683147564,
		name: "40k Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 40_000);
		},
	},
	{
		id: 2683147732,
		name: "75k Medium Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 75_000);
		},
	},
	{
		id: 2683147863,
		name: "250k Big Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 250_000);
		},
	},
	{
		id: 2683148034,
		name: "1M Massive Money Pack",
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 1_000_000);
		},
	},
];

export function getDevProduct(productId: number): DeveloperProduct | undefined {
	const product = developerProducts.find((dp) => dp.id === productId);
	return product;
}

export function handlePurchase(player: Player, productId: number): Enum.ProductPurchaseDecision {
	const product = developerProducts.find((dp) => dp.id === productId);
	if (product) {
		product.grantReward(player);
		return Enum.ProductPurchaseDecision.PurchaseGranted;
	}
	return Enum.ProductPurchaseDecision.NotProcessedYet;
}
