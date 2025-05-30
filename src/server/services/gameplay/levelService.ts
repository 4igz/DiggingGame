import { Service, OnStart } from "@flamework/core";
import { Events, Functions } from "server/network";
import { SkillName } from "shared/networkTypes";
import { ProfileService } from "../backend/profileService";
import Signal from "@rbxts/goodsignal";
import { GamepassService } from "../backend/gamepassService";
import { gameConstants } from "shared/gameConstants";
import { FriendCountService } from "../backend/friendCountService";

@Service({})
export class LevelService implements OnStart {
	constructor(
		private readonly playerDataService: ProfileService,
		private readonly gamepassService: GamepassService,
		private readonly friendCountService: FriendCountService,
	) {}

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
		const BASE_EXP = 100;
		const LEVEL_FORMULA_TRANSITION = 50;
		const TRANSITION_MODIFIER = 13;
		const LEVEL_EXPONENT = 1.05;

		if (level < LEVEL_FORMULA_TRANSITION) {
			return math.floor(BASE_EXP * (level / TRANSITION_MODIFIER));
		} else {
			return math.floor(BASE_EXP * math.pow(level, LEVEL_EXPONENT));
		}
	}
	// private xpForLevel(level: number): number {
	// 	const BASE_EXP = 100;
	// 	const LEVEL_FORMULA_TRANSITION = 20;
	// 	const TRANSITION_MODIFIER = 15; // Attempt to meet the logarithmic formula and then increase linearly.

	// 	if (level < LEVEL_FORMULA_TRANSITION) {
	// 		return math.floor(BASE_EXP * math.log(level + 1, 10));
	// 	} else {
	// 		return math.floor(BASE_EXP * (level / TRANSITION_MODIFIER));
	// 	}
	// }

	public giveLevels(player: Player, levels: number): void {
		const playerProfile = this.playerDataService.getProfile(player);
		if (!playerProfile) return;

		const data = playerProfile.Data;
		for (let i = 0; i < levels; i++) {
			data.level += 1;
			data.skillPoints += 1;
			Events.levelUp.fire(player, data.level);
			this.leveledUp.Fire(player, data.level);
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

	public addExperience(player: Player, addedExperienceAmount: number): void {
		const playerProfile = this.playerDataService.getProfile(player);
		if (!playerProfile) return;

		if (player.MembershipType === Enum.MembershipType.Premium) {
			addedExperienceAmount *= 1.1;
		}

		if (player.IsInGroup(game.CreatorId)) {
			addedExperienceAmount *= 1.1;
		}

		if (this.gamepassService.ownsGamepass(player, gameConstants.GAMEPASS_IDS.VIP)) {
			addedExperienceAmount *= 1.5;
		}

		const friendMult = this.friendCountService.getMultiplier(player);

		addedExperienceAmount *= friendMult;

		const data = playerProfile.Data;
		data.experience += addedExperienceAmount;

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
