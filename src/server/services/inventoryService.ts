import { Service, OnStart } from "@flamework/core";
import { LoadedProfile, ProfileService } from "./profileService";
import { Item, ItemType, Target } from "shared/networkTypes";
import { ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { Events, Functions } from "server/network";
import { metalDetectorConfig, MetalDetectorModule } from "shared/config/metalDetectorConfig";
import { shovelConfig, ShovelModule } from "shared/config/shovelConfig";
import { targetConfig, TargetModule } from "shared/config/targetConfig";
import { ProfileTemplate } from "server/profileTemplate";
import EternityNum from "shared/util/eternityNum";
import { MoneyService } from "./moneyService";
import { Signals } from "shared/signals";

const DetectorFolder = ReplicatedStorage.WaitForChild("MetalDetectors") as Folder;
const ShovelFolder = ReplicatedStorage.WaitForChild("Shovels") as Folder;
const TargetToolFolder = ServerStorage.WaitForChild("TargetTools") as Folder;
const ShovelAccessoryFolder = ServerStorage.WaitForChild("ShovelAccessories") as Folder;

type InventoryKeys<T> = {
	[K in keyof T]: T[K] extends Array<string> | Array<Target> ? K : never;
}[keyof T];

@Service({})
export class InventoryService implements OnStart {
	constructor(private readonly profileService: ProfileService, private readonly moneyService: MoneyService) {}

	onStart() {
		const inventoryConfigMap: Record<
			ItemType,
			{ inventoryKey: InventoryKeys<ProfileTemplate>; config: TargetModule | ShovelModule | MetalDetectorModule }
		> = {
			MetalDetectors: { inventoryKey: "detectorInventory", config: metalDetectorConfig },
			Shovels: { inventoryKey: "shovelInventory", config: shovelConfig },
			Target: { inventoryKey: "targetInventory", config: targetConfig },
		};

		this.profileService.onProfileLoaded.Connect((player: Player, profile) => {
			this.giveTools(player, profile);
			player.CharacterAdded.Connect(() => {
				const newProfile = this.profileService.getProfile(player);
				if (newProfile) {
					this.giveTools(player, newProfile);
				}
			});
		});

		Events.buyItem.connect((player, itemType, item) => {
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

			if (!this.moneyService.hasEnoughMoney(player, cost)) {
				return;
			}

			this.moneyService.takeMoney(player, cost);

			const inventory = profile.Data[inventoryKey];
			inventory.push(item);
			this.profileService.setProfile(player, profile);
			Events.updateInventory(player, itemType, [
				{
					equippedShovel: profile.Data.equippedShovel,
					equippedDetector: profile.Data.equippedDetector,
					equippedTreasure: profile.Data.equippedTreasure,
				},
				inventory.map((value) => ({ name: value, type: itemType as ItemType, ...config[value] } as Item)),
			]);
		});

		Events.equipTreasure.connect((player, targetName) => {
			this.equipTreasure(player, targetName);
		});

		Events.equipItem.connect((player, itemType, itemName) => {
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
			if (!profile.Data[inventoryKey].includes(itemName)) return;

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
					(value) => ({ name: value, type: itemType as ItemType, ...config[value] } as Item),
				),
			]);
		});

		Functions.getInventory.setCallback((player, inventoryType) => {
			const profile = this.profileService.getProfile(player);
			if (!profile) return [{ equippedDetector: "", equippedShovel: "", equippedTreasure: "" }, []];

			const selected = inventoryConfigMap[inventoryType];
			if (!selected) {
				warn("Invalid inventory type requested");
				return [{ equippedDetector: "", equippedShovel: "", equippedTreasure: "" }, []];
			}

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

		if (profile.Data.equippedTreasure) {
			this.addToolToBackpack(backpack, character, TargetToolFolder, profile.Data.equippedTreasure);
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
			return;
		}

		profile.Data.equippedTreasure = targetName;

		this.profileService.setProfile(player, profile);

		this.giveTools(player, profile);
	}

	public addItemToTargetInventory(player: Player, item: Target) {
		const profile = this.profileService.getProfile(player);
		if (profile) {
			profile.Data.targetInventory.push(item);
			this.profileService.setProfile(player, profile);
		}
	}

	public removeTargetItemFromInventory(player: Player, itemId: string) {
		const profile = this.profileService.getProfile(player);
		if (profile) {
			const index = profile.Data.targetInventory.findIndex((invItem) => invItem.itemId === itemId);
			if (index !== -1) {
				profile.Data.targetInventory.remove(index);
				this.profileService.setProfile(player, profile);
			}
		}
	}
}
