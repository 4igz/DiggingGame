import { Players, CollectionService, DataStoreService } from "@rbxts/services";
import { Service, OnStart } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { ProfileService } from "../backend/profileService";
import { formatShortTime, shortenNumber } from "shared/util/nameUtil";
import EternityNum from "shared/util/eternityNum";

interface LeaderboardEntry {
	playerName: string;
	score: number;
	userId: number;
}

@Service()
export class LeaderboardService implements OnStart {
	private readonly LB_DISPLAY_NUM = 25;

	constructor(private readonly profileService: ProfileService) {}

	public onStart(): void {
		const taggedLeaderboards = CollectionService.GetTagged("LeaderboardGui");

		for (const leaderboard of taggedLeaderboards) {
			const trackedStat = leaderboard.GetAttribute("Stat") as string;
			const titleFrame = leaderboard.WaitForChild("Template") as Frame;
			titleFrame.LayoutOrder = -1;
			const listFrame = leaderboard.WaitForChild("List");
			// const place = playerTemplate.WaitForChild("Rank") as TextLabel;

			// place.Text = "#";

			task.spawn(() => {
				const dataStore = DataStoreService.GetOrderedDataStore(`${trackedStat}`);
				const activeEntries: Array<Frame> = [];

				const updateLeaderboard = () => {
					for (const player of Players.GetPlayers()) {
						if (player.UserId < 1) {
							continue;
						}
						task.spawn(() => {
							const [success, err] = pcall(() => {
								const profile = this.profileService.getProfileLoaded(player).expect();
								const data = profile.Data as unknown as Record<string, number>;

								dataStore.UpdateAsync(tostring(player.UserId), () => {
									if (data[trackedStat] === undefined) {
										throw `${trackedStat} does not exist in our profiles!`;
									}
									return math.floor(data[trackedStat]);
								});
							});

							if (!success) {
								warn(err);
							}
						});
					}

					const minValue = 1;
					const maxValue = 10e69;
					const pages = dataStore.GetSortedAsync(false, this.LB_DISPLAY_NUM, minValue, maxValue);
					const top = pages.GetCurrentPage();
					const list: LeaderboardEntry[] = [];

					for (const entry of top) {
						const userId = tonumber(entry.key) as number;
						const stat = entry.value as number;
						let username = "[Failed To Load]";

						const [success, err] = pcall(() => {
							username = Players.GetNameFromUserIdAsync(userId);
						});

						if (!success) {
							warn(`Error getting name for ${userId}. Error: ${err}`);
						}

						list.push({ playerName: username, score: stat, userId: userId });
					}

					activeEntries.forEach((entry) => {
						entry.Destroy();
					});

					for (const [i, listEntry] of Object.entries(list)) {
						const playerFrame = titleFrame.Clone();
						const placeShadow = playerFrame.WaitForChild("Rank") as TextLabel;
						const place = placeShadow.WaitForChild("Rank") as TextLabel;

						const nameShadow = playerFrame.WaitForChild("PlrName") as TextLabel;
						const name = nameShadow.WaitForChild("PlrName") as TextLabel;

						const scoreShadow = playerFrame.WaitForChild("Value") as TextLabel;
						const score = scoreShadow.WaitForChild("Value") as TextLabel;

						playerFrame.LayoutOrder = i;

						const rank = list.indexOf(listEntry) + 1;
						placeShadow.Text = `#${rank}`;
						place.Text = `#${rank}`;

						if (rank === 1) {
							place.TextColor3 = new Color3(1, 0.67, 0.06);
						} else if (rank === 2) {
							place.TextColor3 = new Color3(0.65, 0.65, 0.65);
						} else if (rank === 3) {
							place.TextColor3 = new Color3(0.51, 0.23, 0);
						}

						nameShadow.Text = listEntry.playerName;
						name.Text = listEntry.playerName;

						let value: string | number = listEntry.score;

						if (trackedStat === "playtime") {
							value = formatShortTime(value);
						} else if (trackedStat === "allTimeMoney") {
							value = shortenNumber(value);
						}

						scoreShadow.Text = tostring(value);
						score.Text = tostring(value);

						activeEntries.push(playerFrame);
						playerFrame.Parent = listFrame;
					}
				};

				// Start periodic updates
				task.spawn(() => {
					while (true) {
						updateLeaderboard();
						task.wait(300);
					}
				});
			});
		}
	}
}
