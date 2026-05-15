import type { ServiceIdentifier } from "@freshgum/typedi";

import { useContainer } from "./use-container";
import { useRefFactory } from "@schedule/core/react/hooks";

export const useService = <T>(type: ServiceIdentifier<T>): T => {
    const container = useContainer();
    return useRefFactory(() => container.get(type));
};
