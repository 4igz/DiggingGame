import { targetConfig, trashConfig } from "./targetConfig";

export const difficulties: Record<string, Color3>;

interface MapConfig {
	targetList: Array<keyof typeof targetConfig>;
	recommendedStrength: number;
	difficulty: keyof typeof difficulties;
	order: number;
}

export const mapConfig: Record<string, MapConfig>;
