import { Service, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

@Service({})
export class FriendCountService implements OnStart {
	private ingameFriendCount = new Map<Player, number>();

	onStart() {
		const countFriendsIngame = (player: Player) => {
			let pages = Players.GetFriendsAsync(player.UserId);
			const friendIds: number[] = [];

			while (true) {
				pages.GetCurrentPage().forEach((fi) => friendIds.push(fi.Id));
				if (pages.IsFinished) break;
				pages.AdvanceToNextPageAsync();
			}

			let count = 0;

			for (const id of friendIds) {
				if (Players.GetPlayerByUserId(id)) {
					if (count >= 3) break;
					++count;
				}
			}

			if (count > 0) {
				this.ingameFriendCount.set(player, math.min(count, 3));
			}
		};

		Players.PlayerAdded.Connect(() => {
			for (const player of Players.GetPlayers()) {
				task.spawn(() => {
					countFriendsIngame(player);
				});
			}
		});

		Players.PlayerRemoving.Connect((player) => {
			this.ingameFriendCount.delete(player);
		});
	}

	public getMultiplier(player: Player) {
		return 1 + math.min(0.15, (this.ingameFriendCount.get(player) ?? 0) * 0.05);
	}
}
