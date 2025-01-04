import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { ProfileService } from "./profileService";
import { SkillName } from "shared/networkTypes";

@Service({})
export class LevelService implements OnStart {
	constructor(private readonly playerDataService: ProfileService) {}

	private xpForLevel(level: number): number {
		return math.floor(100 * math.log(level + 1));
	}

	public addExperience(player: Player, amt: number): void {
		const playerProfile = this.playerDataService.getProfile(player);
		if (!playerProfile) return;

		const data = playerProfile.Data;
		data.experience += amt;

		while (true) {
			const currentLevel = data.level;
			const xpForNextLevel = this.xpForLevel(currentLevel + 1);

			if (data.experience >= xpForNextLevel) {
				data.experience -= xpForNextLevel;
				data.level += 1;
				data.skillPoints += 1;
			} else {
				break;
			}
		}

		Events.updateLevelUi.fire(player, data.level, data.experience, this.xpForLevel(data.level + 1));
		this.playerDataService.setProfile(player, playerProfile);
	}

	public getLevelData(player: Player): { level: number; xp: number; xpMax: number } {
		const playerProfile = this.playerDataService.getProfile(player);
		if (!playerProfile) return { level: 1, xp: 0, xpMax: this.xpForLevel(2) };

		const level = playerProfile.Data.level;
		const xpForNextLevel = this.xpForLevel(level + 1);

		return { level: level, xp: playerProfile.Data.experience, xpMax: xpForNextLevel };
	}

	onStart() {
		Functions.getLevelData.setCallback((player: Player) => {
			const levelData = this.getLevelData(player);
			return levelData;
		});

		Events.upgradeSkill.connect((player, skillName: SkillName) => {
			const playerProfile = this.playerDataService.getProfile(player);
			if (!playerProfile) return;

			const data = playerProfile.Data;
			if (data.skillPoints <= 0) return;

			data.skillPoints -= 1;
			data[skillName] += 1;

			this.playerDataService.setProfile(player, playerProfile);

			Events.updateSkills.fire(player, {
				strength: data.strength,
				luck: data.luck,
				detection: data.detection,
			});
		});

		Functions.getSkills.setCallback((player: Player) => {
			const playerProfile = this.playerDataService.getProfile(player);
			if (!playerProfile) return { strength: 1, luck: 1, detection: 1 };

			const data = playerProfile.Data;
			return {
				strength: data.strength,
				luck: data.luck,
				detection: data.detection,
			};
		});
	}
}
