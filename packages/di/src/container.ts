import { CyclicDependencyError, ServiceNotFoundError } from "./errors";
import type { Token } from "./token";
import type {
    AnyDependency,
    Constructor,
    Disposable,
    IMetaClassEntry,
    MetaEntry,
    ResolveDependency,
    Scope,
    ServiceId,
    TupleDeps,
} from "./types";

export const Optional = <T>(id: ServiceId<T>): ResolveDependency<T> => [
    true,
    id,
];

const toTuple = <T>(dep: AnyDependency<T>): ResolveDependency<T> => {
    if (isResolvable(dep)) return dep;
    return [false, dep];
};

const isResolvable = (dep: unknown): dep is ResolveDependency =>
    Array.isArray(dep);

const isDisposable = (value: unknown): value is Disposable =>
    typeof (value as Disposable).dispose === "function";

export class Container {
    private isDisposed = false;

    private readonly meta = new Map<ServiceId, MetaEntry>();
    private readonly instances = new Map<ServiceId, unknown>();

    public constructor(private readonly parent?: Container) {}

    public registerValue<T>(id: Token<T>, value: T): this {
        this.throwIfDisposed();

        this.meta.set(id, { kind: "value", value });

        return this;
    }

    public registerClass<TArgs extends unknown[], T>(
        ctor: Constructor<T, TArgs>,
        deps: TupleDeps<TArgs>,
        scope: Scope = "singleton",
    ): this {
        this.throwIfDisposed();

        this.meta.set(ctor, {
            kind: "class",
            ctor: ctor,
            deps: deps.map(toTuple),
            scope,
        });

        return this;
    }

    public child(): Container {
        this.throwIfDisposed();
        return new Container(this);
    }

    public get<T>(id: ServiceId<T>): T {
        this.throwIfDisposed();
        return this.resolve(id, new Set(), []);
    }

    private resolve<T>(
        id: ServiceId<T>,
        resolving: Set<ServiceId>,
        chain: ServiceId[],
        requester: Container = this,
    ): T {
        if (this.instances.has(id)) {
            return this.instances.get(id) as T;
        }

        const entry = this.meta.get(id) as MetaEntry<T> | undefined;

        if (!entry) {
            if (this.parent) {
                return this.parent.resolve(id, resolving, chain, requester);
            }
        } else {
            if (entry.kind === "value") {
                return entry.value;
            }

            if (entry.kind === "class") {
                return this.instantiate(id, entry, resolving, chain, requester);
            }
        }

        throw new ServiceNotFoundError(id, chain);
    }

    private resolveTuple<T>(
        resolvable: ResolveDependency<T>,
        resolving: Set<ServiceId>,
        chain: ServiceId[],
        requester: Container,
    ): T | undefined {
        const [optional, id] = resolvable;

        try {
            return this.resolve(id, resolving, chain, requester);
        } catch (error) {
            if (optional && error instanceof ServiceNotFoundError) {
                return undefined;
            }

            throw error;
        }
    }

    private instantiate<T>(
        id: ServiceId<T>,
        entry: IMetaClassEntry<T>,
        resolving: Set<ServiceId>,
        chain: ServiceId[],
        requester: Container,
    ): T {
        if (resolving.has(id)) {
            throw new CyclicDependencyError([...chain, id]);
        }

        resolving.add(id);

        try {
            const deps = entry.deps.map((dep) =>
                this.resolveTuple(dep, resolving, [...chain, id], requester),
            );

            const instance = new entry.ctor(...deps);

            if (entry.scope === "singleton") {
                this.instances.set(id, instance);
            }

            if (entry.scope === "container") {
                requester.instances.set(id, instance);
            }

            return instance;
        } finally {
            resolving.delete(id);
        }
    }

    public dispose(): void {
        for (const instance of this.instances.values()) {
            if (isDisposable(instance)) {
                instance.dispose();
            }
        }

        this.instances.clear();
        this.meta.clear();

        this.isDisposed = true;
    }

    public clear() {
        this.instances.clear();
    }

    private throwIfDisposed() {
        if (this.isDisposed) {
            throw new Error("The container is disposed");
        }
    }
}
