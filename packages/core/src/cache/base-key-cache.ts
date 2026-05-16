import type { KeyCache } from "./types";

export abstract class BaseKeyCache<Key, Value> implements KeyCache<Key, Value> {
	protected readonly map = new Map<Key, Value>();

	public evict(shouldEvict: (value: Value, key: Key, map: Map<Key, Value>) => boolean) {
		for (const [key, value] of this.map.entries()) {
			if (shouldEvict(value, key, this.map)) {
				this.map.delete(key);
			}
		}
	}

	public clear() {
		this.map.clear();
	}

	public has(key: Key) {
		return this.map.has(key);
	}

	public get values() {
		return [...this.map.values()];
	}

	public get keys() {
		return [...this.map.keys()];
	}

	public get entries() {
		return [...this.map.entries()];
	}

	public forEach(fn: (key: Key, value: Value) => void) {
		for (const [key, value] of this.map) {
			fn(key, value);
		}
	}

	public find(predicate: (key: Key, value: Value) => boolean): Value | undefined {
		for (const [key, value] of this.map) {
			if (predicate(key, value)) return value;
		}
		return undefined;
	}

	public delete(key: Key) {
		return this.map.delete(key);
	}
}
