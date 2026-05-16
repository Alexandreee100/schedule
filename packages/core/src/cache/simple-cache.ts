import { assertAndReturn } from "../asserts";
import { BaseKeyCache } from "./base-key-cache";
import type { Factory } from "./types";

export class SimpleCache<Key, Value> extends BaseKeyCache<Key, Value> {
    constructor(private readonly factory: Factory<Key, Value>) {
        super();
    }

    public getOrCreate(key: Key, onCreate?: (value: Value) => void) {
        const cachedValue = this.map.get(key);
        if (cachedValue !== undefined) return cachedValue;

        const created = this.factory(key);
        this.map.set(key, created);
        onCreate?.(created);
        return created;
    }

    public getOrThrow(key: Key) {
        const cached = this.map.get(key);

        return assertAndReturn(
            cached,
            `Entity with key ${key} not found in cache`,
        );
    }
}
