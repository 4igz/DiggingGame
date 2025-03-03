import { CollectionService } from "@rbxts/services";

export const isDescendantOfTag = (instance: Instance, tagName: string): Instance | undefined => {
	while (instance !== undefined) {
		if (CollectionService.HasTag(instance, tagName)) {
			return instance;
		}
		instance = instance.Parent!;
	}
	return undefined;
};
