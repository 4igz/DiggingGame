import { RunService } from "@rbxts/services";

export function debugWarn(message: string, context?: string, printMode: boolean = false) {
	if (RunService.IsStudio()) {
		if (printMode) {
			print(`[${context ?? "DEBUG"}] ${message}`);
		} else {
			warn(`[${context ?? "DEBUG"}] ${message}`);
		}
	}
}
