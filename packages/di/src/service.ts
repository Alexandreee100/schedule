import type { Container } from "./container";
import { ContainerInstance } from "./container-instance";
import type { AnyDependency, Constructor, Scope } from "./types";

interface ServiceOptions {
    deps?: AnyDependency[];
    scope?: Scope;
    container?: Container;
}

export function Service(options: ServiceOptions = {}) {
    return <T extends Constructor<unknown>>(
        target: T,
        _context: ClassDecoratorContext<T>,
    ) => {
        const { deps = [], scope, container = ContainerInstance } = options;
        container.registerClass(target, deps, scope);
        return target;
    };
}
