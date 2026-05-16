export interface KeyCache<Key, Value> {
    values: Array<Value>;

    keys: Array<Key>;

    entries: Array<[Key, Value]>;

    forEach: (fn: (key: Key, value: Value) => void) => void;

    find: (predicate: (key: Key, value: Value) => boolean) => Value | undefined;

    has: (key: Key) => boolean;

    delete: (key: Key) => boolean;

    evict: (
        shouldEvict: (value: Value, key: Key, map: Map<Key, Value>) => boolean,
    ) => void;
}

export type Factory<Key, Value> = (key: Key) => Value;

export type AsyncFactory<Key, Value> = (key: Key) => Promise<Value>;

export type Predicate<Key, Value> = (key: Key, value: Value) => boolean;
