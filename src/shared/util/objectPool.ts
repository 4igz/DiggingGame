export class ObjectPool<T extends Instance> {
	private objects: T[] = [];
	private readonly objectKind: keyof Instances;

	constructor(private readonly factory: () => T, startSize: number = 1) {
		const sampleInstance = factory();
		assert(typeOf(sampleInstance) === "Instance", "ObjectPool factory must return an Instance");
		this.objectKind = sampleInstance.ClassName as keyof Instances;
		if (startSize > 0) {
			this.objects.push(sampleInstance);
			startSize--;
		}

		for (let i = 0; i < startSize; i++) {
			this.objects.push(factory());
		}
	}

	acquire(): T {
		return this.objects.size() > 0 ? this.objects.pop()! : this.factory();
	}

	release(obj: T) {
		assert(obj.ClassName === this.objectKind, "ObjectPool: Tried to release an object of the wrong type");
		this.objects.push(obj);
		obj.Parent = undefined;
	}
}
