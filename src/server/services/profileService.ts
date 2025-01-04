import { Service, OnStart } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { GetProfileStore, Profile } from "@rbxts/rbx-profileservice-plus";
import { Players } from "@rbxts/services";
import { ProfileTemplate, profileTemplate } from "server/profileTemplate";

export type LoadedProfile = Profile<ProfileTemplate>;

@Service({})
export class ProfileService implements OnStart {
	public onProfileLoaded = new Signal<(player: Player, profile: LoadedProfile) => void>();
	public profileChanged = new Signal<(player: Player, profile: LoadedProfile) => void>();

	private profileStore = GetProfileStore("v1", profileTemplate);
	private profileCache = new Map<Player, Profile<ProfileTemplate>>();

	onStart() {
		for (const player of Players.GetPlayers()) {
			this.onPlayerAdded(player);
		}

		Players.PlayerAdded.Connect((player) => this.onPlayerAdded(player));

		Players.PlayerRemoving.Connect((player) => {
			const profile = this.profileCache.get(player);
			if (profile) {
				profile.Release();
				this.profileCache.delete(player);
			}
		});
	}

	// Load and cache the profile for the player
	onPlayerAdded(player: Player) {
		this.profileStore
			.LoadProfileAsync(tostring(player.UserId))
			.andThen((profile) => {
				profile?.AddUserId(player.UserId);
				profile?.Reconcile();
				profile?.ListenToRelease(() => {
					this.profileCache.delete(player);
					player.Kick();
				});
				if (player.IsDescendantOf(Players) && profile) {
					this.profileCache.set(player, profile);
					this.onProfileLoaded.Fire(player, profile as LoadedProfile);
				} else {
					profile?.Release();
				}
			})
			.catch((e) => {
				player.Kick();
			});
	}

	public getProfile(player: Player): LoadedProfile | undefined {
		if (!this.profileCache.has(player)) {
			return undefined;
		}
		return this.profileCache.get(player) as LoadedProfile;
	}

	public setProfile(player: Player, profile: LoadedProfile) {
		if (!this.profileCache.has(player)) {
			error("Player profile not loaded, use onProfileLoaded to wait for the profile to load");
		}
		this.profileCache.set(player, profile);
		this.profileChanged.Fire(player, profile as LoadedProfile);
	}
}
