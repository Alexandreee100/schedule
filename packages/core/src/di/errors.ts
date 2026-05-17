import { Token } from "./token";
import type { ServiceId } from "./types";

const idToString = (id: ServiceId): string => {
    if (id instanceof Token) {
        return `Token ${id.name}`;
    }

    return id.name;
};

export class ServiceNotFoundError extends Error {
    public constructor(id: ServiceId, chain: ServiceId[] = []) {
        const path = [...chain, id].map(idToString).join(" → ");
        super(`Service not found: ${path}`);
    }
}

export class CyclicDependencyError extends Error {
    public constructor(chain: ServiceId[]) {
        super(
            `Cyclic dependency detected: ${chain.map(idToString).join(" → ")}`,
        );
    }
}
