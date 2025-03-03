//!optimize 2
import { ReplicatedStorage } from "@rbxts/services";

export function observeAttribute(
	attributeName: string,
	defaultValue: AttributeValue,
	instance: Instance = ReplicatedStorage,
): AttributeValue {
	if (instance.GetAttribute(attributeName) === undefined) {
		instance.SetAttribute(attributeName, defaultValue);
	}
	return instance.GetAttribute(attributeName)!;
}
