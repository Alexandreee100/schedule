import type { ServiceIdentifier } from "@freshgum/typedi";
import { useRefFactory } from "@/shared/hooks/use-ref-factory";

import { useContainer } from "./use-container";

export const useService = <T>(type: ServiceIdentifier<T>): T => {
    const container = useContainer();
    return useRefFactory(() => container.get(type));
};
