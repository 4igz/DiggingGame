import { Service, OnStart } from "@flamework/core";
import { ProfileService } from "./profileService";
import { RunService, Players } from "@rbxts/services";
import Signal from "@rbxts/goodsignal";

interface TimeUnit {
    name: string;
    seconds: number;
    maxDisplay: number; 
}

@Service({})
export class PlaytimeService implements OnStart {
    private playerSessionStartTimes: Map<Player, number> = new Map();
    private playtimeUpdateInterval = 30; // Choose when to update
    private lastPlaytimeUpdate = 0;


    private readonly TIME_UNITS: TimeUnit[] = [
        { name: "w", seconds: 604800, maxDisplay: 2 }, // 7 days * 24 hours * 60 minutes * 60 seconds
        { name: "d", seconds: 86400, maxDisplay: 2 },  // 24 hours * 60 minutes * 60 seconds
        { name: "h", seconds: 3600, maxDisplay: 2 },   // 60 minutes * 60 seconds
        { name: "m", seconds: 60, maxDisplay: 2 },     // 60 seconds
        { name: "s", seconds: 1, maxDisplay: 1 }       // base
    ];

    public playtimeUpdated = new Signal<(player: Player, formattedPlaytime: string, totalSeconds: number) => void>();

    constructor(
        private readonly profileService: ProfileService,
    ) {}

    onStart() {
        // Handle existing loaded profiles
        for (const [player] of this.profileService.getLoadedProfiles()) {
            this.playerSessionStartTimes.set(player, tick());
        }

        // Handle new profiles being loaded
        this.profileService.onProfileLoaded.Connect((player) => {
            this.playerSessionStartTimes.set(player, tick());
        });

        // Handle player leaving
        Players.PlayerRemoving.Connect((player) => {
            this.savePlayerPlaytimeToProfile(player);
            this.playerSessionStartTimes.delete(player);
        });

        RunService.Heartbeat.Connect(() => {
            const currentTime = tick();
            if (currentTime - this.lastPlaytimeUpdate >= this.playtimeUpdateInterval) {
                this.updateAllPlaytimeDisplays();
                this.lastPlaytimeUpdate = currentTime;
            }
        });
    }

    private updateAllPlaytimeDisplays() {
        for (const [player] of this.playerSessionStartTimes) {
            this.updatePlaytimeDisplay(player);
        }
    }

    private updatePlaytimeDisplay(player: Player) {
        const totalPlaytime = this.getTotalPlaytimeSeconds(player);
        const formattedPlaytime = this.formatPlaytime(totalPlaytime);
        
        // Fire signal for leaderstat update only
        this.playtimeUpdated.Fire(player, formattedPlaytime, totalPlaytime);
    }

    private savePlayerPlaytimeToProfile(player: Player) {
        const profile = this.profileService.getProfile(player);
        if (!profile) return;

        const sessionStartTime = this.playerSessionStartTimes.get(player);
        if (!sessionStartTime) return;

        const sessionDuration = tick() - sessionStartTime;
        const newTotalPlaytime = (profile.Data.playtime || 0) + sessionDuration;

        // Update profile data
        profile.Data.playtime = newTotalPlaytime;
        this.profileService.setProfile(player, profile);
    }

     //Formats playtime in seconds to better format
    public formatPlaytime(totalSeconds: number): string {
        const seconds = math.floor(totalSeconds);
        
        const parts: string[] = [];
        let remainingSeconds = seconds;

        for (let i = 0; i < this.TIME_UNITS.size(); i++) {
            const unit = this.TIME_UNITS[i];
            const unitValue = math.floor(remainingSeconds / unit.seconds);

            if (unitValue > 0) {
                parts.push(`${unitValue}${unit.name}`);
                remainingSeconds = remainingSeconds % unit.seconds;

                if (parts.size() >= unit.maxDisplay) {
                    break;
                }
            }

            // Special case: if we're at seconds and have no other parts, show it
            if (unit.name === "s" && parts.size() === 0) {
                parts.push(`${remainingSeconds}s`);
                break;
            }
        }

        return parts.size() > 0 ? parts.join(" ") : "0s";
    }

    public getCurrentPlaytime(player: Player): string {
        const totalPlaytime = this.getTotalPlaytimeSeconds(player);
        return this.formatPlaytime(totalPlaytime);
    }

    public getTotalPlaytimeSeconds(player: Player): number {
        const profile = this.profileService.getProfile(player);
        if (!profile) return 0;
        
        const sessionStartTime = this.playerSessionStartTimes.get(player);
        const sessionDuration = sessionStartTime ? tick() - sessionStartTime : 0;
        
        return (profile.Data.playtime || 0) + sessionDuration;
    }

	// can be used on server shutdown
    public saveAllPlaytimes() {
        for (const [player] of this.playerSessionStartTimes) {
            this.savePlayerPlaytimeToProfile(player);
            // Reset session start time after saving
            this.playerSessionStartTimes.set(player, tick());
        }
    }
}