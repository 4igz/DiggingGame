import { Service, OnStart } from "@flamework/core";
import { Events } from "server/network";
import { ProfileService } from "../profileService";
import { Players } from "@rbxts/services";

@Service({})
export class ClientDetections implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		// Player will self-report if they hit any of our detections, or if they just fire the remote themselves.
		Events.selfReport.connect((player, reportType) => {
			const profile = this.profileService.getProfileLoaded(player).expect();

			profile.Data.isExploiter = true;
			profile.Data.exploitReasons.push(reportType);
			profile.Data.selfReports++;

			this.profileService.setProfile(player, profile);
		});

		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				const humanoid = character.WaitForChild("Humanoid") as Humanoid;

				let lastRecordedPosition = character.GetPivot();
				let alive = true;
				humanoid.Died.Connect(() => {
					alive = false;
				});

				task.spawn(() => {
					while (alive) {
						task.wait(1);
						lastRecordedPosition = character.GetPivot();
					}
				});

				// This isn't a very accurate detection, hence why we only target known exploiters.
				const ALLOWABLE_SPEED = 30;

				humanoid.Running.Connect((speed) => {
					if (speed > ALLOWABLE_SPEED) {
						const profile = this.profileService.getProfile(player);
						if (profile?.Data.isExploiter) {
							// Only known exploiters will catch this detection
							character.PivotTo(lastRecordedPosition);
						}
					}
				});

				humanoid.Swimming.Connect((speed) => {
					if (speed > ALLOWABLE_SPEED) {
						const profile = this.profileService.getProfile(player);
						if (profile?.Data.isExploiter) {
							// Only known exploiters will catch this detection
							character.PivotTo(lastRecordedPosition);
						}
					}
				});
			});
		});
	}
}
