import type { Token } from "./token";

export type Constructor<T, TArgs extends any[] = any[]> = new (
    ...args: TArgs
) => T;

export type ServiceId<T = unknown> = Token<T> | Constructor<T>;

export type Scope = "singleton" | "transient" | "container";

export type ResolveDependency<T = unknown> = readonly [
    optional: boolean,
    id: ServiceId<T>,
];
export type AnyDependency<T = unknown> = ServiceId<T> | ResolveDependency<T>;
export type TupleDeps<TArgs extends unknown[]> = [
    ...{ [K in keyof TArgs]: AnyDependency<TArgs[K]> },
];

interface IMetaValueEntry<T> {
    kind: "value";
    value: T;
}

export interface IMetaClassEntry<T> {
    kind: "class";
    ctor: Constructor<T>;
    deps: ResolveDependency[];
    scope: Scope;
}

// Discriminated union — токен хранит значение, класс хранит метаданные для инстанцирования
export type MetaEntry<T = unknown> = IMetaValueEntry<T> | IMetaClassEntry<T>;
