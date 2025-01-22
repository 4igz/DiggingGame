import { gameConstants } from "shared/constants";
import { Signals } from "shared/signals";

const IDS = gameConstants.DEVPRODUCT_IDS;

interface DeveloperProduct {
	id: number;
	name: string;
	cashReward?: number;
	grantReward: (player: Player) => void;
}

export const developerProducts: DeveloperProduct[] = [
	{
		id: IDS["1k Money Pack"],
		name: "1k Money Pack",
		cashReward: 1_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 1_000);
		},
	},
	{
		id: IDS["2.5k Money Pack"],
		name: "2.5k Money Pack",
		cashReward: 2_500,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 2_500);
		},
	},
	{
		id: IDS["7.5k Money Pack"],
		name: "7.5k Money Pack",
		cashReward: 7_500,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 7_500);
		},
	},
	{
		id: IDS["15k Money Pack"],
		name: "15k Money Pack",
		cashReward: 15_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 15_000);
		},
	},
	{
		id: IDS["40k Money Pack"],
		name: "40k Money Pack",
		cashReward: 40_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 40_000);
		},
	},
	{
		id: IDS["75k Medium Money Pack"],
		name: "75k Medium Money Pack",
		cashReward: 75_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 75_000);
		},
	},
	{
		id: IDS["250k Big Money Pack"],
		name: "250k Big Money Pack",
		cashReward: 250_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 250_000);
		},
	},
	{
		id: IDS["1M Massive Money Pack"],
		name: "1M Massive Money Pack",
		cashReward: 1_000_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 1_000_000);
		},
	},
	{
		id: IDS.RefundPoints,
		name: "Refund Points",
		grantReward: (player) => {
			Signals.resetSkills.Fire(player);
		},
	},
];

export function getDevProduct(productId: number): DeveloperProduct | undefined {
	const product = developerProducts.find((dp) => dp.id === productId);
	return product;
}

export function handlePurchase(player: Player, productId: number): Enum.ProductPurchaseDecision {
	const product = getDevProduct(productId);
	if (product) {
		product.grantReward(player);
		return Enum.ProductPurchaseDecision.PurchaseGranted;
	}
	return Enum.ProductPurchaseDecision.NotProcessedYet;
}
