import { RunService } from "@rbxts/services";

export function debugWarn(message: string, context?: string) {
	if (RunService.IsStudio()) {
		warn(`[${context ?? "DEBUG"}] ${message}`);
	}
}
