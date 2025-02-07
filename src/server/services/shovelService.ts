import { Service, OnStart } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";
import { shovelConfig } from "shared/config/shovelConfig";
import { findFurthestPointWithinRadius } from "shared/util/detectorUtil";
import { ProfileService } from "./profileService";
import { gameConstants } from "shared/constants";
import { Events } from "server/network";
import { interval } from "shared/util/interval";

const Maps = CollectionService.GetTagged("Map");

@Service({})
export class ShovelService implements OnStart {
	constructor(private readonly profileService: ProfileService) {}

	onStart() {
		const canDigInterval = interval(0.5);

		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				character.ChildAdded.Connect((instance) => {
					if (!this.instanceIsShovel) return;

					while (instance.Parent === character) {
						task.wait();
						if (!canDigInterval(player.UserId)) continue;
						const profile = this.profileService.getProfile(player);
						if (!profile) break;
						const map = Maps.find((map) => map.Name === profile.Data.currentMap) as Folder | undefined;
						if (!map) break;
						const bases = map.FindFirstChild("SpawnBases") as Folder | undefined;
						if (!bases) break;

						if (
							findFurthestPointWithinRadius(
								character.GetPivot().Position,
								bases.GetChildren() as BasePart[],
								gameConstants.DIG_RANGE,
							)
						) {
							Events.canDig.fire(player, true);
						} else {
							Events.canDig.fire(player, false);
						}
					}
				});
			});
		});
	}

	instanceIsShovel(instance: Instance) {
		return instance.IsA("Tool") && shovelConfig[instance.Name] !== undefined;
	}
}
