//!optimize 2

import { Players } from "@rbxts/services";

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

/**
 * Returns a promise that resolves when the specified player is disconnected. If
 * the player is not a descendant of the Players service, the promise will
 * immediately resolve.
 *
 * @param player - The player to wait for disconnection.
 * @returns A promise that resolves when the player is disconnected.
 */
export async function promisePlayerDisconnected(player: Player): Promise<void> {
	if (!player.IsDescendantOf(Players)) {
		return;
	}

	await Promise.fromEvent(Players.PlayerRemoving, (playerWhoLeft) => playerWhoLeft === player);
}
