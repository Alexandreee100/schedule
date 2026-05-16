import { action, makeObservable } from "mobx";
import { assertAndReturn } from "../asserts";
import { ObservableBaseCacheKey } from "./observable-base-cache-key";
import type { Factory } from "./types";

export class ObservableFactoryCache<Key, Value> extends ObservableBaseCacheKey<Key, Value> {
	protected override readonly name = "ObservableFactoryCache";

	constructor() {
		super();
		makeObservable(this, { getOrCreate: action });
	}

	public getOrCreate(key: Key, factory: Factory<Key, Value>, onCreate?: (value: Value) => void) {
		const cached = this.map.get(key);
		if (cached !== undefined) return cached;
		const created = factory(key);
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
