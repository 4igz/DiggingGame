import { Service, OnStart } from "@flamework/core";
import { Events } from "server/network";
import { ProfileService } from "../profileService";

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

			warn(`${player.Name} self-reported for ${reportType}`);
		});
	}
}
