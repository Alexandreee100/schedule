import { action, makeObservable } from "mobx";
import { assertAndReturn } from "../asserts";
import { ObservableBaseCacheKey } from "./observable-base-cache-key";
import type { Factory } from "./types";

export class ObservableSimpleCache<Key, Value> extends ObservableBaseCacheKey<Key, Value> {
	protected override readonly name = "ObservableSimpleCache";

	constructor(private readonly factory: Factory<Key, Value>) {
		super();
		makeObservable(this, { getOrCreate: action });
	}

	public getOrCreate(key: Key, onCreate?: (value: Value) => void) {
		const cachedValue = this.map.get(key);
		if (cachedValue !== undefined) return cachedValue;

		const created = this.factory(key);
		this.map.set(key, created);
		this.atom.reportChanged();
		onCreate?.(created);
		return created;
	}

	public getOrThrow(key: Key) {
		const cached = this.map.get(key);

		return assertAndReturn(cached, `Entity with key ${key} not found in cache`);
	}
}
