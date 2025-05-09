//!optimize 2
//!native
import { Service, OnStart, OnTick } from "@flamework/core";
import { LoadedProfile, ProfileService } from "../backend/profileService";
import { Item, ItemName, ItemType, Target, TargetItem } from "shared/networkTypes";
import { CollectionService, Players, ServerStorage } from "@rbxts/services";
import { Events, Functions } from "server/network";
import { metalDetectorConfig, MetalDetectorModule } from "shared/config/metalDetectorConfig";
import { shovelConfig, ShovelModule } from "shared/config/shovelConfig";
import { fullTargetConfig, targetConfig, TargetModule } from "shared/config/targetConfig";
import { ProfileTemplate } from "server/profileTemplate";
import { MoneyService } from "../backend/moneyService";
import { Signals } from "shared/signals";
import { boatConfig } from "shared/config/boatConfig";
import { PotionConfig, potionConfig, PotionKind } from "shared/config/potionConfig";
import { interval } from "shared/util/interval";
import { gameConstants } from "shared/gameConstants";
import { GamepassService } from "../backend/gamepassService";

const DetectorFolder = ServerStorage.WaitForChild("MetalDetectors") as Folder;
const ShovelFolder = ServerStorage.WaitForChild("Shovels") as Folder;
const TargetToolFolder = ServerStorage.WaitForChild("TargetTools") as Folder;
const ShovelAccessoryFolder = ServerStorage.WaitForChild("ShovelAccessories") as Folder;

const BIGGER_BACKPACK_SIZE_MODIFIER = gameConstants.BIGGER_BACKPACK_SIZE_MODIFIER;

type InventoryKeys<T> = {
	[K in keyof T]: T[K] extends Array<string> | Array<TargetItem> ? K : never;
}[keyof T];

export interface PotionEffect {
	timeRemaining: number;
	multiplier: number;
	potionName: keyof typeof potionConfig;
}

const inventoryConfigMap: Record<
	ItemType,
	{
		inventoryKey: InventoryKeys<ProfileTemplate>;
		config: TargetModule | ShovelModule | MetalDetectorModule | typeof boatConfig | typeof potionConfig;
	}
> = {
	MetalDetectors: { inventoryKey: "detectorInventory", config: metalDetectorConfig },
	Shovels: { inventoryKey: "shovelInventory", config: shovelConfig },
	Target: { inventoryKey: "targetInventory", config: fullTargetConfig },
	Boats: {
		inventoryKey: "targetInventory",
		config: boatConfig,
	},
	Potions: {
		inventoryKey: "potionInventory",
		config: potionConfig,
	},
};

@Service({})
export class InventoryService implements OnStart, OnTick {
	private potionDrinkers = new Array<Player>();

	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly gamepassService: GamepassService,
	) {}

	onStart() {
		for (const tool of DetectorFolder.GetChildren()) {
			if (tool.IsA("Tool")) {
				if (metalDetectorConfig[tool.Name] === undefined) {
					warn(`Detector tool ${tool.Name} is missing from the metalDetectorConfig`);
					continue;
				}
				CollectionService.AddTag(tool, "Detector");
			}
		}

		for (const tool of ShovelFolder.GetChildren()) {
			if (tool.IsA("Tool")) {
				if (shovelConfig[tool.Name] === undefined) {
					warn(`Shovel tool ${tool.Name} is missing from the shovelConfig`);
					continue;
				}
			}
		}

		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				const toolMotorContainer = character.WaitForChild("RightHand") as BasePart;
				const motor = new Instance("Motor6D");
				motor.Enabled = false;
				motor.Part0 = toolMotorContainer;
				motor.Name = "ToolMotor";
				motor.Parent = toolMotorContainer;

				character.ChildAdded.Connect((child) => {
					if (child.IsA("Tool") && shovelConfig[child.Name]) {
						const handle = child.WaitForChild("Shovel") as BasePart;
						motor.Part1 = handle;
						motor.Enabled = true;

						child.AncestryChanged.Once(() => {
							motor.Part1 = undefined;
							motor.Enabled = false;
						});
					}
				});
			});
		});

		Players.PlayerRemoving.Connect((player) => {
			this.potionDrinkers = this.potionDrinkers.filter((p) => p !== player);
		});

		this.profileService.onProfileLoaded.Connect((player: Player, profile) => {
			if (profile.Data.activePotions.size() > 0) {
				if (!this.potionDrinkers.includes(player)) {
					this.potionDrinkers.push(player);
				}
				const potions = [];
				for (const [_kind, effect] of pairs(profile.Data.activePotions)) {
					const cfg = table.clone(potionConfig[effect.potionName]) as PotionConfig & {
						potionName: keyof typeof potionConfig;
						timeLeft: number;
					};
					cfg.potionName = effect.potionName;
					cfg.timeLeft = effect.timeRemaining;

					potions.push(cfg);
				}
				Events.updateActivePotions.fire(player, potions);
			}

			Events.updateInventorySize(player, this.getInventorySize(player));

			this.giveTools(player, profile);
			player.CharacterAdded.Connect(() => {
				this.profileService.getProfileLoaded(player).then((loadedProfile) => {
					this.giveTools(player, loadedProfile);
				});
			});
		});

		Functions.getInventorySize.setCallback((player) => {
			return this.getInventorySize(player);
		});

		Events.buyItem.connect((player, itemType, item) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			const selected = inventoryConfigMap[itemType];
			if (!selected) {
				warn("Invalid inventory type requested " + itemType);
				return;
			}

			const { inventoryKey, config } = selected;
			if (inventoryKey === "targetInventory" || !("price" in config[item])) return;

			// Check if player already owns the item
			if (profile.Data[inventoryKey].includes(item)) {
				Events.purchaseFailed(player, itemType);
				Events.sendInvalidActionPopup(player, `You already own this!`);
				return;
			}

			const cfg = config[item];

			if (cfg.notForSale === true) {
				Events.purchaseFailed(player, itemType);
				Events.sendInvalidActionPopup(player, `You can't buy this!`);
				return;
			}

			const cost = cfg.price;

			if (!this.moneyService.hasEnoughMoney(player, cost)) {
				Events.purchaseFailed(player, itemType);
				Events.sendInvalidActionPopup(player, `You can't afford this!`);
				return;
			}

			this.moneyService.takeMoney(player, cost);

			this.onItemBoughtSuccess(player, itemType, item);
		});

		Events.buyBoat.connect((player, boatName) => {
			const cfg = boatConfig[boatName];

			if (cfg.notForSale) {
				Events.purchaseFailed(player, "Boats");
				Events.sendInvalidActionPopup(player, `You can't buy this!`);
				return;
			}

			const cost = cfg.price;

			if (!cost || !this.moneyService.hasEnoughMoney(player, cost)) {
				Events.purchaseFailed(player, "Boats");
				Events.sendInvalidActionPopup(player, `You can't afford this!`);
				return;
			}

			this.moneyService.takeMoney(player, cost);

			this.onBoatBoughtSuccess(player, boatName);
		});

		Events.equipTreasure.connect((player, targetName) => {
			this.equipTreasure(player, targetName);
		});

		Events.equipItem.connect((player, itemType: Exclude<ItemType, "Target">, itemName) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			const selected = inventoryConfigMap[itemType];
			if (!selected) {
				warn("Invalid inventory type requested");
				return;
			}

			const { inventoryKey, config } = selected;
			if (inventoryKey === "targetInventory") return;

			// Check if player has the item
			if (!profile.Data[inventoryKey].includes(itemName)) {
				Events.sendInvalidActionPopup(player, `You don't own this item!`);
				return;
			}

			profile.Data[`equipped${itemType === "MetalDetectors" ? "Detector" : "Shovel"}`] = itemName;
			this.profileService.setProfile(player, profile);
			this.giveTools(player, profile);
			Events.updateInventory(player, itemType, [
				{
					equippedShovel: profile.Data.equippedShovel,
					equippedDetector: profile.Data.equippedDetector,
					equippedTreasure: profile.Data.equippedTreasure,
				},
				profile.Data[inventoryKey].map(
					(value) => ({ name: value, type: itemType as ItemType, ...config[value as string] } as Item),
				),
			]);
		});

		Events.drinkPotion.connect((player, potionName) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return;

			const potion = potionConfig[potionName];
			if (!potion) return;

			if (profile.Data.potionInventory.includes(potionName)) {
				const potionIndex = profile.Data.potionInventory.indexOf(potionName);
				profile.Data.potionInventory.remove(potionIndex); // remove from their inventory

				// Get the effect type from the potion
				const effectType = potion.kind;

				// Check if this effect type is already active
				const existingEffect = profile.Data.activePotions.get(effectType);

				// Create or update the effect
				const updatedEffect: PotionEffect = {
					timeRemaining: (existingEffect?.timeRemaining || 0) + potion.duration,
					multiplier: math.max(existingEffect?.multiplier || 1, potion.multiplier),
					potionName: potionName,
				};

				// Store the updated effect
				profile.Data.activePotions.set(effectType, updatedEffect);

				Events.drankPotion(player, potionName);

				// Update the appropriate multiplier based on effect type
				this.updatePotionMultipliers(profile);

				this.profileService.setProfile(player, profile);
				if (!this.potionDrinkers.includes(player)) {
					this.potionDrinkers.push(player);
				}

				// Update the inventory UI
				Events.updateInventory(player, "Potions", [
					{
						equippedShovel: profile.Data.equippedShovel,
						equippedDetector: profile.Data.equippedDetector,
						equippedTreasure: profile.Data.equippedTreasure,
					},
					profile.Data.potionInventory.map(
						(value) => ({ name: value, type: "Potions", ...potionConfig[value as string] } as Item),
					),
				]);
			}
		});

		Functions.getInventory.setCallback((player, inventoryType) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			const selected = inventoryConfigMap[inventoryType] ?? error("Invalid inventory type requested");

			const { inventoryKey, config } = selected;
			const inventory = profile.Data[inventoryKey];

			return [
				{
					equippedDetector: profile.Data.equippedDetector,
					equippedShovel: profile.Data.equippedShovel,
					equippedTreasure: profile.Data.equippedTreasure,
				},
				inventory.map((value) => {
					const name = typeOf(value) === "string" ? (value as string) : (value as Target).name;
					let item;

					// If the item is a target, we need to give it the actual item
					if (typeOf(value) === "table") {
						item = { name, type: inventoryType, ...(value as object) };
					} else {
						item = { name, type: inventoryType, ...config[name] };
					}
					return item as Item;
				}),
			];
		});

		Functions.getUnlockedTargets.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.previouslyFoundTargets;
		});

		Functions.getOwnedBoats.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.ownedBoats;
		});

		Signals.giveLuckPot.Connect((player, amt) => {
			for (let i = 0; i < amt; i++) {
				this.givePotion(player, "M.Luck Potion");
			}
		});
		Signals.giveStrengthPot.Connect((player, amt) => {
			for (let i = 0; i < amt; i++) {
				this.givePotion(player, "M.Strength Potion");
			}
		});
	}

	givePotion(player: Player, potionName: keyof typeof potionConfig) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		profile.Data.potionInventory.push(potionName);
		this.profileService.setProfile(player, profile);

		Events.updateInventory(player, "Potions", [
			{
				equippedShovel: profile.Data.equippedShovel,
				equippedDetector: profile.Data.equippedDetector,
				equippedTreasure: profile.Data.equippedTreasure,
			},
			profile.Data.potionInventory.map(
				(value) => ({ name: value, type: "Potions", ...potionConfig[value] } as Item),
			),
		]);
	}

	getInventorySize(player: Player) {
		const profile = this.profileService.getProfileLoaded(player).expect();

		const ownsBiggerBackpack = this.gamepassService.ownsGamepass(
			player,
			gameConstants.GAMEPASS_IDS["BiggerBackpack"],
		);

		return profile.Data.inventorySize * (ownsBiggerBackpack ? BIGGER_BACKPACK_SIZE_MODIFIER : 1);
	}

	onItemBoughtSuccess(player: Player, itemType: ItemType, item: ItemName) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		const selected = inventoryConfigMap[itemType];
		if (!selected) {
			warn("Invalid inventory type requested");
			return;
		}

		const { inventoryKey, config } = selected;
		if (inventoryKey === "targetInventory" || !("price" in config[item])) return;

		// Check if player already owns the item
		if (profile.Data[inventoryKey].includes(item)) {
			return;
		}

		const cost = config[item].price;

		const inventory = profile.Data[inventoryKey];
		inventory.push(item as string & TargetItem);
		const equippedItemKey = itemType === "MetalDetectors" ? "equippedDetector" : "equippedShovel";
		const equippedItem = profile.Data[equippedItemKey];
		const equippedItemPrice = "price" in config[equippedItem] ? config[equippedItem].price : 0;
		if (!equippedItem || cost > equippedItemPrice) {
			profile.Data[equippedItemKey] = item;
			this.giveTools(player, profile);
		}
		Events.updateInventory(player, itemType, [
			{
				equippedShovel: profile.Data.equippedShovel,
				equippedDetector: profile.Data.equippedDetector,
				equippedTreasure: profile.Data.equippedTreasure,
			},
			inventory.map((value) => ({ name: value, type: itemType as ItemType, ...config[value as string] } as Item)),
		]);
		this.profileService.setProfile(player, profile);

		Events.boughtItem(player, item, itemType, config[item]);
	}

	onBoatBoughtSuccess(player: Player, boatName: string) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		if (profile.Data.ownedBoats.get(boatName) === true) return;

		profile.Data.ownedBoats.set(boatName, true);
		this.profileService.setProfile(player, profile);

		Events.updateBoatInventory(player, profile.Data.ownedBoats);
		Events.boughtItem(player, boatName, "Boats", boatConfig[boatName]);
	}

	// Add a helper method to update all potion multipliers
	private updatePotionMultipliers(profile: LoadedProfile) {
		// Reset all multipliers to default value
		profile.Data.potionLuckMultiplier = 1;
		profile.Data.potionStrengthMultiplier = 1;

		// Update each multiplier based on active effects
		for (const [effectType, effect] of profile.Data.activePotions) {
			switch (effectType) {
				case PotionKind.LUCK:
					profile.Data.potionLuckMultiplier = effect.multiplier;
					break;
				case PotionKind.STRENGTH:
					profile.Data.potionStrengthMultiplier = effect.multiplier;
					break;
			}
		}
	}

	private POTION_SEC_INTERVAL = interval(1);

	// Update the onTick method to handle multiple potion types
	onTick(): void {
		const playersToRemove = new Array<Player>();

		for (const player of this.potionDrinkers) {
			if (!player.IsDescendantOf(Players)) {
				playersToRemove.push(player);
				continue;
			}

			if (this.POTION_SEC_INTERVAL(player.UserId)) {
				const profile = this.profileService.getProfile(player);
				if (!profile) continue;

				if (profile.Data.activePotions.size() > 0) {
					let anyPotionActive = false;

					// Iterate through all active effects
					for (const [effectType, effect] of profile.Data.activePotions) {
						// Reduce the time remaining
						effect.timeRemaining--;

						// If the effect has expired, remove it
						if (effect.timeRemaining <= 0) {
							profile.Data.activePotions.delete(effectType);
						} else {
							anyPotionActive = true;
						}
					}

					// Update all multipliers based on remaining effects
					this.updatePotionMultipliers(profile);

					// If no effects remain active, remove player from potionDrinkers
					if (!anyPotionActive) {
						playersToRemove.push(player);
					}

					this.profileService.setProfile(player, profile);
				} else {
					playersToRemove.push(player);
				}
			}
		}

		// Remove players after the loop
		this.potionDrinkers = this.potionDrinkers.filter((p) => !playersToRemove.includes(p));
	}

	subtractFromHighestMultiplierPotion(activePotions: Map<keyof typeof potionConfig, number>): [boolean, number] {
		if (activePotions.size() === 0) return [false, 1];
		const [highestMultiplierName, highestMultiplier] = this.getHighestMultiplierPotionName(activePotions);

		if (highestMultiplierName !== "") {
			const timeLeft = activePotions.get(highestMultiplierName) as number;
			activePotions.set(highestMultiplierName, timeLeft - 1);
			return [true, highestMultiplier];
		}

		return [false, 1];
	}

	getHighestMultiplierPotionName(activePotions: Map<keyof typeof potionConfig, number>): [string, number] {
		let highestMultiplierName: keyof typeof potionConfig = "";
		let highestMultiplier = 1;
		for (const [potionName, timeLeft] of activePotions) {
			if (timeLeft <= 0) {
				activePotions.delete(potionName);
				continue;
			}

			const potionCfg = potionConfig[potionName];
			const { multiplier } = potionCfg;

			if (multiplier > highestMultiplier) {
				highestMultiplier = multiplier;
				highestMultiplierName = potionName;
			}
		}

		return [highestMultiplierName, highestMultiplier];
	}

	giveTools(player: Player, profile: LoadedProfile) {
		const character = player.Character || player.CharacterAdded.Wait()[0];
		if (!character) return;

		const backpack = player.WaitForChild("Backpack") as Backpack;
		backpack.ClearAllChildren();

		this.cleanCharacterToolsAndAccessories(character, profile);

		const detector = this.addToolToBackpack(backpack, character, DetectorFolder, profile.Data.equippedDetector);
		if (detector) {
			Signals.detectorInitialized.Fire(player, detector);
		}

		const shovelTool = this.addToolToBackpack(backpack, character, ShovelFolder, profile.Data.equippedShovel);

		const shovelAccessory = ShovelAccessoryFolder.FindFirstChild(profile.Data.equippedShovel);
		if (shovelAccessory && shovelTool) {
			this.addAccessoryToCharacter(character, shovelAccessory);
			shovelTool.AncestryChanged.Connect(() => {
				if (shovelTool.Parent === character) {
					const accessory = character.FindFirstChild(shovelAccessory.Name);
					if (accessory && accessory.IsA("Accessory")) {
						accessory.Destroy();
					}
				} else if (shovelTool.Parent === backpack) {
					this.addAccessoryToCharacter(character, shovelAccessory);
				}
			});
		}

		if (profile.Data.equippedTreasure !== "") {
			this.addToolToBackpack(backpack, character, TargetToolFolder, profile.Data.equippedTreasure);
		} else {
			character.GetChildren().forEach((child) => {
				if (child.IsA("Tool") && fullTargetConfig[child.Name]) {
					child.Destroy();
				}
			});
			backpack.GetChildren().forEach((child) => {
				if (child.IsA("Tool") && fullTargetConfig[child.Name]) {
					child.Destroy();
				}
			});
		}
	}

	cleanCharacterToolsAndAccessories(character: Model, profile: LoadedProfile) {
		character.GetChildren().forEach((child) => {
			if (child.IsA("Tool")) {
				const { equippedDetector, equippedShovel, equippedTreasure } = profile.Data;
				if (![equippedDetector, equippedShovel, equippedTreasure].includes(child.Name)) {
					child.Destroy();
				}
			}
			if (child.IsA("Accessory") && child.AccessoryType === Enum.AccessoryType.Back) {
				child.Destroy();
			}
			if (child.IsA("Accessory") && shovelConfig[child.Name]) {
				child.Destroy();
			}
		});
	}

	addToolToBackpack(backpack: Backpack, character: Model, folder: Folder, toolName: string): Tool | undefined {
		if (!toolName) return;

		const tool = folder.FindFirstChild(toolName)?.Clone();
		if (tool && !backpack.FindFirstChild(tool.Name) && !character.FindFirstChild(tool.Name) && tool.IsA("Tool")) {
			tool.Parent = backpack;
			return tool;
		}
	}

	addAccessoryToCharacter(character: Model, accessory: Instance) {
		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid && accessory.IsA("Accessory") && !character.FindFirstChild(accessory.Name)) {
			humanoid.AddAccessory(accessory.Clone());
		}
	}

	equipTreasure(player: Player, targetName: keyof typeof targetConfig) {
		const profile = this.profileService.getProfile(player);
		if (!profile) return;

		const target = profile.Data.targetInventory.find((item) => item.name === targetName);

		if (!target) {
			profile.Data.equippedTreasure = "";
			this.profileService.setProfile(player, profile);
			this.giveTools(player, profile);
			return;
		}

		profile.Data.equippedTreasure = targetName;

		this.profileService.setProfile(player, profile);

		this.giveTools(player, profile);
	}

	public addItemToTargetInventory(player: Player, item: Target) {
		const profile = this.profileService.getProfile(player);
		if (profile) {
			if (profile.Data.targetInventory.size() >= this.getInventorySize(player)) {
				error("Unhandled full inventory case", 2);
			}
			profile.Data.targetInventory.push({ itemId: item.itemId, name: item.name, weight: item.weight });
			if (!profile.Data.previouslyFoundTargets.has(item.name)) {
				profile.Data.previouslyFoundTargets.add(item.name);
			}
			this.profileService.setProfile(player, profile);
			Events.targetAdded(player, item.name, item.weight, profile.Data.currentMap);
			Events.updateInventory(player, "Target", [
				{
					equippedShovel: profile.Data.equippedShovel,
					equippedDetector: profile.Data.equippedDetector,
					equippedTreasure: profile.Data.equippedTreasure,
				},
				profile.Data.targetInventory.map((item) => ({
					...item,
					name: item.name,
					type: "Target",
				})),
			]);
			Events.updateUnlockedTargets(player, profile.Data.previouslyFoundTargets);
			Events.updateTreasureCount(player, profile.Data.targetInventory.size());
		}
	}

	public removeTargetItemFromInventory(player: Player, itemId: string) {
		const profile = this.profileService.getProfile(player);
		if (profile) {
			const index = profile.Data.targetInventory.findIndex((invItem) => invItem.itemId === itemId);
			if (index !== -1) {
				const target = profile.Data.targetInventory[index];
				profile.Data.targetInventory.remove(index);
				Events.updateTreasureCount(player, profile.Data.targetInventory.size());

				if (profile.Data.equippedTreasure === target.name) {
					if (!profile.Data.targetInventory.find((item) => item.name === target.name)) {
						profile.Data.equippedTreasure = "";
						this.giveTools(player, profile);
					}
				}

				this.profileService.setProfile(player, profile);
			}
		}
	}
}
