import { BaseKeyCache } from "./base-key-cache";
import type { Factory } from "./types";
import { assertAndReturn } from "../asserts";

export class FactoryCache<Key, Value> extends BaseKeyCache<Key, Value> {
    public getOrCreate(key: Key, factory: Factory<Key, Value>, onCreate?: (value: Value) => void) {
        const cached = this.map.get(key);
        if (cached !== undefined) return cached;
        const created = factory(key);
        this.map.set(key, created);
        onCreate?.(created);
        return created;
    }

    public getOrThrow(key: Key) {
        const cached = this.map.get(key);
        return assertAndReturn(cached, `Entity with key ${key} not found in cache`);
    }
}
