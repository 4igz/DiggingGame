import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { SkillName } from "shared/networkTypes";
import { gameConstants } from "shared/gameConstants";
import { ProfileService } from "../backend/profileService";
import Signal from "@rbxts/goodsignal";

@Service({})
export class LevelService implements OnStart {
	constructor(private readonly playerDataService: ProfileService) {}

	public leveledUp = new Signal<(player: Player, level: number) => void>();

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
			Events.updateLevelUi.fire(
				player,
				data.level,
				data.experience,
				this.xpForLevel(data.level + 1),
				data.skillPoints,
			);
		});

		Functions.getSkills.setCallback((player: Player) => {
			const playerProfile = this.playerDataService.getProfileLoaded(player).expect();

			const data = playerProfile.Data;
			return {
				strength: data.strength,
				luck: data.luck,
				detection: data.detection,
			};
		});
	}

	private xpForLevel(level: number): number {
		return math.floor(gameConstants.BASE_EXP * math.pow(level, gameConstants.LEVEL_INCREASE_EXPONENT));
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
				Events.levelUp.fire(player, data.level);
				this.leveledUp.Fire(player, data.level);
			} else {
				break;
			}
		}

		Events.updateLevelUi.fire(
			player,
			data.level,
			data.experience,
			this.xpForLevel(data.level + 1),
			data.skillPoints,
		);
		this.playerDataService.setProfile(player, playerProfile);
	}

	public getLevelData(player: Player): { level: number; xp: number; xpMax: number; skillPoints: number } {
		const playerProfile = this.playerDataService.getProfileLoaded(player).expect();

		const level = playerProfile.Data.level;
		const xpForNextLevel = this.xpForLevel(level + 1);

		return {
			level: level,
			xp: playerProfile.Data.experience,
			xpMax: xpForNextLevel,
			skillPoints: playerProfile.Data.skillPoints,
		};
	}
}
