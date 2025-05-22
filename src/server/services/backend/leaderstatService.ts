import { Service, OnStart } from "@flamework/core";
import { LoadedProfile, ProfileService } from "./profileService";
import EternityNum from "shared/util/eternityNum";
import { Events, Functions } from "server/network";
import { MoneyService } from "./moneyService";
import { EN } from "shared/networkTypes";
import { LevelService } from "../gameplay/levelService";
import { TargetService } from "../gameplay/targetService";
import { PlaytimeService } from "./playtimeService";
import { formatShortTime } from "shared/util/nameUtil";

@Service({})
export class LeaderstatService implements OnStart {
	constructor(
		private readonly profileService: ProfileService,
		private readonly moneyService: MoneyService,
		private readonly levelService: LevelService,
		private readonly targetService: TargetService,
		private readonly playtimeService: PlaytimeService,
	) {}

	onStart() {
		// Handle existing loaded profiles
		for (const [player, profile] of this.profileService.getLoadedProfiles()) {
			this.createLeaderstats(player, profile);
		}

		// Handle new profiles being loaded
		this.profileService.onProfileLoaded.Connect((player, profile) => {
			this.createLeaderstats(player, profile);
		});

		// Connect to money changes
		this.moneyService.moneyChanged.Connect((player, moneyValue: EN) => {
			const leaderstats = player.FindFirstChild("leaderstats");
			if (leaderstats) {
				const money = leaderstats.FindFirstChild("Money") as StringValue | undefined;
				if (money) {
					money.Value = EternityNum.short(moneyValue);
				}
			}
		});

		// Connect to level changes
		this.levelService.leveledUp.Connect((player, level) => {
			const leaderstats = player.FindFirstChild("leaderstats");
			if (leaderstats) {
				const levelValue = leaderstats.FindFirstChild("Level") as IntValue | undefined;
				if (levelValue) {
					levelValue.Value = level;
				}
			}
		});

		// Connect to treasures dug changes
		this.targetService.dugTreasures.Connect((player, treasuresDug) => {
			const leaderstats = player.FindFirstChild("leaderstats");
			if (leaderstats) {
				const foundValue = leaderstats.FindFirstChild("Found") as IntValue | undefined;
				if (foundValue) {
					foundValue.Value = treasuresDug;
				}
			}
		});

		// Connect to playtime changes
		this.playtimeService.playtimeUpdated.Connect((player, totalTime) => {
			const leaderstats = player.FindFirstChild("leaderstats");
			if (leaderstats) {
				const playtimeValue = leaderstats.FindFirstChild("Playtime") as StringValue | undefined;
				if (playtimeValue) {
					playtimeValue.Value = formatShortTime(totalTime);
				}
			}
		});

		Functions.getMoneyShortString.setCallback((player) => {
			const profile = this.profileService.getProfileLoaded(player).expect();
			return profile.Data.money;
		});
	}

	private createLeaderstats(player: Player, profile: LoadedProfile) {
		const leaderstats = new Instance("Folder");
		leaderstats.Name = "leaderstats";
		leaderstats.Parent = player;

		const level = new Instance("IntValue");
		level.Name = "Level";
		level.Value = profile.Data.level;
		level.Parent = leaderstats;

		const treasuresDug = new Instance("IntValue");
		treasuresDug.Name = "Found";
		treasuresDug.Value = profile.Data.treasuresDug;
		treasuresDug.Parent = leaderstats;

		const money = new Instance("StringValue");
		money.Name = "Money";
		money.Value = EternityNum.short(EternityNum.fromString(profile.Data.money));
		money.Parent = leaderstats;

		const playtime = new Instance("StringValue");
		playtime.Name = "Playtime";
		playtime.Value = formatShortTime(this.playtimeService.getCurrentPlaytime(player));
		playtime.Parent = leaderstats;
	}
}
