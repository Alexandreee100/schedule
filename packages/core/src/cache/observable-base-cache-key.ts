import { action, createAtom, makeObservable } from "mobx";

import type { KeyCache } from "./types";

export abstract class ObservableBaseCacheKey<Key, Value>
    implements KeyCache<Key, Value>
{
    protected readonly name: string = "ObservableBaseCacheKey";
    protected readonly atom = createAtom(this.name);
    protected readonly map = new Map<Key, Value>();

    protected constructor() {
        makeObservable(this, {
            evict: action,
            clear: action,
            delete: action,
        });
    }

    public get values() {
        this.atom.reportObserved();
        return [...this.map.values()];
    }

    public get keys() {
        this.atom.reportObserved();
        return [...this.map.keys()];
    }

    public get entries() {
        this.atom.reportObserved();
        return [...this.map.entries()];
    }

    public has(key: Key) {
        this.atom.reportObserved();
        return this.map.has(key);
    }

    public forEach(fn: (key: Key, value: Value) => void) {
        this.atom.reportObserved();
        for (const [key, value] of this.map) {
            fn(key, value);
        }
    }

    public get(key: Key): Value | undefined {
        this.atom.reportObserved();
        return this.map.get(key);
    }

    public find(
        predicate: (key: Key, value: Value) => boolean,
    ): Value | undefined {
        this.atom.reportObserved();
        for (const [key, value] of this.map) {
            if (predicate(key, value)) return value;
        }
        return undefined;
    }

    public evict(
        shouldEvict: (value: Value, key: Key, map: Map<Key, Value>) => boolean,
    ) {
        let isChanged = false;
        for (const [key, value] of this.map.entries()) {
            if (shouldEvict(value, key, this.map)) {
                isChanged = this.map.delete(key);
            }
        }

        if (isChanged) {
            this.atom.reportChanged();
        }
    }

    public clear() {
        this.map.clear();
        this.atom.reportChanged();
    }

    public delete(key: Key) {
        const isRemoved = this.map.delete(key);
        if (isRemoved) {
            this.atom.reportChanged();
        }
        return isRemoved;
    }
}
