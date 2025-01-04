export const setParticleDescendantsEnabled = (parent: Instance, enabled: boolean = true) => {
	for (const descendant of parent.GetDescendants()) {
		if (descendant.IsA("ParticleEmitter")) {
			descendant.Enabled = enabled;
		}
	}
};

export const emitParticleDescendants = (parent: Instance, count: number = 1) => {
	for (const descendant of parent.GetDescendants()) {
		if (descendant.IsA("ParticleEmitter")) {
			descendant.Emit(count);
		}
	}
};
