//!optimize 2
import { UserInputService } from "@rbxts/services";

type Platforms = "Mobile" | "PC" | "Console" | "Unknown";

export function getPlayerPlatform(): Platforms {
	if (UserInputService.TouchEnabled && !UserInputService.MouseEnabled) {
		return "Mobile";
	} else if (UserInputService.GamepadEnabled && !UserInputService.KeyboardEnabled && !UserInputService.MouseEnabled) {
		return "Console";
	} else if (UserInputService.KeyboardEnabled || UserInputService.MouseEnabled) {
		return "PC";
	} else {
		return "Unknown";
	}
}
