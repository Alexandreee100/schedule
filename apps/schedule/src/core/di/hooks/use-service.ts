import { useRefFactory } from "@schedule/core/react/hooks";
import type { ServiceId } from "@schedule/di";
import { useContainer } from "./use-container";

export const useService = <T>(type: ServiceId<T>): T => {
    const container = useContainer();
    return useRefFactory(() => container.get(type));
};
