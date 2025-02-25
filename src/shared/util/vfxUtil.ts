//!optimize 2
//!native
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

export const emitUsingAttributes = (parent: Instance) => {
	for (const descendant of parent.GetDescendants()) {
		if (descendant.IsA("ParticleEmitter")) {
			const emitCount = descendant.GetAttribute("EmitCount") as number | undefined;
			descendant.Emit(emitCount);
		}
	}
};
