//!optimize 2
//!native
const humanoidCache = new Map<Player, Humanoid>();

export function findPlayerHumanoid(player: Player): Humanoid | undefined {
	const character = player.Character;
	if (!character) {
		return undefined;
	}

	// Check the cache first
	const cachedHumanoid = humanoidCache.get(player);
	if (cachedHumanoid && cachedHumanoid.Parent === character) {
		return cachedHumanoid;
	} else {
		// Remove stale entry
		humanoidCache.delete(player);

		// Find a new Humanoid in the Character
		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid) {
			humanoidCache.set(player, humanoid);
			return humanoid;
		}
	}

	return undefined;
}
