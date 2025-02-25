import { Service, OnStart } from "@flamework/core";
import { Events } from "server/network";
import { ProfileService } from "../profileService";
import { BanService } from "./banService";
import { ReplicatedStorage } from "@rbxts/services";

@Service({})
export class ClientDetections implements OnStart {
	constructor(private readonly profileService: ProfileService, private readonly banService: BanService) {}

	onStart() {
		const honeypotRemoteFolder = ReplicatedStorage.WaitForChild("Remotes") as Folder;

		const HOUR = 60 * 60;

		// Player will self-report if they hit any of our detections.
		Events.selfReport.connect((player, reportType) => {
			const profile = this.profileService.getProfile(player);

			if (!profile) return;

			// First self-report ban is 3 days, second is perma.
			const banTime = profile.Data.banTimes === 0 ? 72 * HOUR : -1;

			switch (reportType) {
				case "Flying":
					warn(`${player.Name} is flying!`);
					profile.Data.isExploiter = true;
					this.banService.banPlayer(player, "Flying", banTime);
					break;
				case "HumanoidEdit":
					warn(`${player.Name} is modifying their humanoid properties!`);
					profile.Data.isExploiter = true;
					this.banService.banPlayer(player, "HumanoidEdit", banTime);
					break;
				case "HopperBin":
					warn(`${player.Name} has a HopperBin!`);
					profile.Data.isExploiter = true;
					this.banService.banPlayer(player, "HopperBin", banTime);
					break;
				case "CustomScript":
					warn(`${player.Name} had an error that wasn't caused by us!`);
					// this.banService.banPlayer(player, "CustomScript", banTime);
					profile.Data.isExploiter = true;
					break;
				case "GravityMod":
					warn(`${player.Name} is modifying gravity!`);
					this.banService.banPlayer(player, "GravityMod", banTime);
					profile.Data.isExploiter = true;
					break;
				case "Speed Hacking (PhysicsFPS)":
					warn(`${player.Name} is speed hacking!`);
					this.banService.banPlayer(player, "Speed Hacking (PhysicsFPS)", banTime);
					profile.Data.isExploiter = true;
					break;
				case "FEGod (StateChange)":
					warn(`${player.Name} is using FE God!`);
					this.banService.banPlayer(player, "FEGod (StateChange)", banTime);
					profile.Data.isExploiter = true;
					break;
				case "FEGod (NoHumanoid)":
					warn(`${player.Name} is using FE God!`);
					this.banService.banPlayer(player, "FEGod (NoHumanoid)", banTime);
					profile.Data.isExploiter = true;
					break;
				default:
					break;
			}

			this.profileService.setProfile(player, profile);
		});

		// Honeypot detections
		// If a player triggers any of these, they will be banned.
		// For more information, read README in the honeypot folder.
		for (const child of honeypotRemoteFolder.GetChildren()) {
			if (child.IsA("RemoteEvent")) {
				child.OnServerEvent.Connect((player) => {
					const profile = this.profileService.getProfile(player);
					if (!profile) return;
					profile.Data.isExploiter = true;
					this.banService.banPlayer(player, "Honeypot");
					this.profileService.setProfile(player, profile);
				});
			}
		}
	}
}
