export enum ProductType {
	GamePass,
	DevProduct,
}

export interface ShopItem {
	title: string;
	subtitle: string;
	description: string;
	image: string;
	itemType: "Claim" | "Buy";
	claimed?: () => void;
	price?: number;
	backgroundColor?: ColorSequence;
	subtitleColor?: Color3;
	reward?: string;
	productId?: number;
	productType?: ProductType;
}

export const shopConfig: Array<ShopItem> = [
	{
		title: "[!] Limited Offer",
		subtitle: "NEW",
		description: "Give a LIKE 👍 and join the GROUP!",
		image: "",
		itemType: "Claim",
		reward: "500 Cash",
		subtitleColor: Color3.fromRGB(235, 68, 246),
		backgroundColor: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(235, 68, 246)),
			new ColorSequenceKeypoint(0.317, Color3.fromRGB(235, 68, 246)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(203, 47, 255)),
		]),
		claimed: () => {
			print("Claimed!");
		},
	},
	{
		title: "[$] 2x Dig Speed",
		subtitle: "BESTSELLER",
		description: "Doubles your dig speed!",
		image: "",
		itemType: "Buy",
		backgroundColor: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(71, 224, 255)),
			new ColorSequenceKeypoint(0.317, Color3.fromRGB(71, 224, 255)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(28, 187, 255)),
		]),
		subtitleColor: Color3.fromRGB(71, 224, 255),
		productId: 1,
		productType: ProductType.GamePass,
	},
];
