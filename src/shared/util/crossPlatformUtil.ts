//!optimize 2
import { UserInputService } from "@rbxts/services";

type Platforms = "Mobile" | "PC" | "Console" | "Unknown";

export function getPlayerPlatform(): Platforms {
	if (UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled) {
		return "Mobile";
	} else if (UserInputService.KeyboardEnabled && UserInputService.MouseEnabled) {
		return "PC";
	} else if (UserInputService.GamepadEnabled) {
		return "Console";
	} else {
		return "Unknown";
	}
}
