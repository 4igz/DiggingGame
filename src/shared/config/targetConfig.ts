import { Rarity } from "../networkTypes";
import Sift from "@rbxts/sift";

export interface TargetConfig {
	reqStrength: number; // Required strength to detect the target
	rarity: number; // The higher the chance, the less likely it will spawn
	baseWeight: NumberRange; // Base weight of the target
	basePrice: number; // Base sell price of the target
	rarityType: Rarity;
	itemImage: string;
	animationName?: string; // If not specified, will just be default tool animation.
	description?: string; // Optional description of the item
}

export type TargetModule = Readonly<Record<string, TargetConfig>>;

export const targetConfig: TargetModule = {
	// Grasslands
	"Bag of coins": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://82293616105219",
		animationName: "Hold",
		description: "A small bag filled with shiny coins. It's not worth much, but it's a nice find.",
	},
	Ring: {
		reqStrength: 10,
		rarity: 10,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 20,
		itemImage: "rbxassetid://78683428732466",
		description: "A simple ring, likely lost by someone long ago. It's not worth much, but it has a story to tell.",
	},
	Necklace: {
		reqStrength: 15,
		rarity: 15,
		rarityType: "Common",
		baseWeight: new NumberRange(10, 30),
		basePrice: 30,
		itemImage: "rbxassetid://81302821988412",
		animationName: "Hold",
		description:
			"A necklace that was likely lost by someone long ago. It's not worth much, but it has a story to tell.",
	},
	"Treasure Chest": {
		reqStrength: 50,
		rarity: 500,
		rarityType: "Uncommon",
		baseWeight: new NumberRange(20, 100),
		basePrice: 100,
		itemImage: "rbxassetid://116848950666878",
		animationName: "OverheadHold",
		description: "A chest filled with various treasures. It's quite heavy, but it's a nice find.",
	},
	Diamond: {
		reqStrength: 30,
		rarity: 500,
		rarityType: "Rare",
		baseWeight: new NumberRange(5, 15),
		basePrice: 500,
		itemImage: "rbxassetid://77396148774213",
		animationName: "Hold",
		description: "A shiny diamond..",
	},
	"Ancient Artifact": {
		reqStrength: 100,
		rarity: 1000,
		rarityType: "Legendary",
		baseWeight: new NumberRange(20, 100),
		basePrice: 1000,
		itemImage: "rbxassetid://104605374928382",
		description: "An ancient artifact that's worth a fortune. It's quite heavy for its size.",
	},

	// Volcano
	"Volcano rock": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://118432059776108",
		description: "A rock from the volcano.",
	},
	"Volcano's tear": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://121295076787199",
		description: "A tear from the volcano.",
	},
	Ammonoids: {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://81329471085203",
		description: "A fossil of an ancient creature.",
	},
	"Heat rock": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://118432059776108",
		description: "A rock that's warm to the touch.",
	},
	"Lava bucket": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://81391518039132",
		description: "A bucket filled with lava.",
	},
	"Obsidian shard": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://115688166680356",
		description: "A shard of obsidian.",
	},
	"Coal artifact": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://129994688332470",
		description: "An artifact made of coal.",
	},

	// Frozen
	"Ice shard": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://122468325756667",
		description: "A shard of ice.",
	},
	"Old mitten": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://114451456116905",
		description: "An old mitten.",
	},
	"Sapphire gem": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://84253809232755",
		description: "A sapphire gem.",
	},
	"Viking dagger": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://136607393225332",
		description: "A viking dagger.",
	},
	"Viking sword": {
		reqStrength: 5,
		rarity: 5,
		rarityType: "Common",
		baseWeight: new NumberRange(5, 20),
		basePrice: 10,
		itemImage: "rbxassetid://107882679708293",
		description: "A viking sword.",
	},
};

// Where we store trash items, those that are obtained when the player has 0 luckMult
export const trashConfig: TargetModule = {
	["Rusty nail"]: {
		reqStrength: 0,
		rarity: 1,
		rarityType: "Common",
		baseWeight: new NumberRange(2.5, 11),
		basePrice: 2.5,
		itemImage: "rbxassetid://80374057285043",
	},
	["Scrap"]: {
		reqStrength: 0,
		rarity: 1,
		rarityType: "Common",
		baseWeight: new NumberRange(2.5, 11),
		basePrice: 2.5,
		itemImage: "rbxassetid://80374057285043",
	},
	["Old T-Shirt"]: {
		reqStrength: 0,
		rarity: 1,
		rarityType: "Common",
		baseWeight: new NumberRange(2.5, 11),
		basePrice: 2.5,
		itemImage: "rbxassetid://134314922415893",
	},
	["Old boot"]: {
		reqStrength: 0,
		rarity: 1,
		rarityType: "Common",
		baseWeight: new NumberRange(2.5, 11),
		basePrice: 2.5,
		itemImage: "rbxassetid://91884190576086",
	},
	["Old ring"]: {
		reqStrength: 0,
		rarity: 1,
		rarityType: "Common",
		baseWeight: new NumberRange(2.5, 11),
		basePrice: 2.5,
		itemImage: "rbxassetid://87736149466419",
	},
	["Old coin"]: {
		reqStrength: 0,
		rarity: 1,
		rarityType: "Common",
		baseWeight: new NumberRange(2.5, 11),
		basePrice: 2.5,
		itemImage: "rbxassetid://111334825894769",
	},
};

export const fullTargetConfig: TargetModule = Sift.Dictionary.merge(targetConfig, trashConfig);
