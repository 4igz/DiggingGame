//!optimize 2
import { gameConstants } from "shared/gameConstants";
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
		name: "Handful of Cash",
		cashReward: 2_500,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 2_500);
		},
	},
	{
		id: IDS["7.5k Money Pack"],
		name: "Sack of Cash",
		cashReward: 7_500,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 7_500);
		},
	},
	{
		id: IDS["15k Money Pack"],
		name: "Bag of Cash",
		cashReward: 15_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 15_000);
		},
	},
	{
		id: IDS["40k Money Pack"],
		name: "Crate of Cash",
		cashReward: 40_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 40_000);
		},
	},
	{
		id: IDS["75k Medium Money Pack"],
		name: "Chest of Cash",
		cashReward: 75_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 75_000);
		},
	},
	{
		id: IDS["250k Big Money Pack"],
		name: "Vault of Cash",
		cashReward: 250_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 250_000);
		},
	},
	{
		id: IDS["1M Massive Money Pack"],
		name: "Fortune of Cash",
		cashReward: 1_000_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 1_000_000);
		},
	},
	{
		id: IDS["2.5M Pirate's Treasure"],
		name: "Pirate's Treasure",
		cashReward: 1_000_000,
		grantReward: (player) => {
			Signals.addMoney.Fire(player, 2_500_000);
		},
	},
	{
		id: IDS.RefundPoints,
		name: "Refund Points",
		grantReward: (player) => {
			Signals.resetSkills.Fire(player);
		},
	},
	{
		id: IDS.MoreDigging,
		name: "Multi Digging",
		grantReward: (player) => {
			Signals.giveMultiDig.Fire(player);
		},
	},
	{
		id: IDS.x2Luck,
		name: "x2 Luck",
		grantReward: (player) => {
			Signals.buyServerLuckMultiplier.Fire(player);
		},
	},
	{
		id: IDS["Unlock All Playtime Rewards"],
		name: "Unlock All Playtime Rewards",
		grantReward: (player) => {
			Signals.unlockPlaytimeRewards.Fire(player);
		},
	},
	{
		id: IDS.StarterPack,
		name: "Starter Pack",
		grantReward: (player) => {
			Signals.giveLimitedOffer.Fire(player);
		},
	},
	// {
	// 	id: IDS.MediumPack,
	// 	name: "Medium Pack",
	// 	grantReward: (player) => {
	// 		Signals.addMoney.Fire(player, 2_500);
	// 		Signals.giveMultiDig.Fire(player);
	// 	},
	// },
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
