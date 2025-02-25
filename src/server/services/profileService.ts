import { Service, OnStart, OnInit } from "@flamework/core";
import Signal from "@rbxts/goodsignal";
import { GetProfileStore, Profile } from "@rbxts/rbx-profileservice-plus";
import { Players } from "@rbxts/services";
import { Events } from "server/network";
import { PROFILE_STORE_NAME, ProfileTemplate, profileTemplate } from "server/profileTemplate";

export type LoadedProfile = Profile<ProfileTemplate>;

@Service({
	loadOrder: 0, // We want this service to exist before other services
})
export class ProfileService implements OnInit {
	public onProfileLoaded = new Signal<(player: Player, profile: LoadedProfile) => void>();
	public profileChanged = new Signal<(player: Player, profile: LoadedProfile) => void>();

	private profileStore = GetProfileStore(PROFILE_STORE_NAME, profileTemplate);
	private profileCache = new Map<Player, Profile<ProfileTemplate>>();

	public getLoadedProfiles(): Map<Player, LoadedProfile> {
		return this.profileCache as Map<Player, LoadedProfile>;
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

	// Load and cache the profile for the player
	private onPlayerAdded(player: Player) {
		const DATA_KEY = tostring(player.UserId);

		this.profileStore
			.LoadProfileAsync(DATA_KEY)
			.andThen((profile) => {
				profile?.AddUserId(player.UserId);
				profile?.Reconcile();
				profile?.ListenToRelease(() => {
					this.profileCache.delete(player);
					if (player.IsDescendantOf(Players)) {
						player.Kick("Player data was loaded in another server. Disconnecting to prevent data loss.");
					}
				});
				if (player.IsDescendantOf(Players) && profile) {
					this.profileCache.set(player, profile);
					this.onProfileLoaded.Fire(player, profile as LoadedProfile);
					Events.profileReady.fire(player);
				} else {
					profile?.Release();
				}
			})
			.catch((e) => {
				// Prevent data loss/corruption. If the profile fails to load, kick the player.
				player.Kick("Failed to load player data. Please rejoin.");
				error(e);
			});
	}

	onInit() {
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
}
