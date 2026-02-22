import type { ServiceIdentifier } from "@freshgum/typedi";
import { useRefFactory } from "src/shared/hooks/use-ref-factory";

import { useContainer } from "@/di/hooks/use-container";

export const useService = <T extends any>(type: ServiceIdentifier<T>): T => {
    const container = useContainer();
    return useRefFactory(() => container.get(type));
};
