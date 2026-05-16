import type { ServiceIdentifier } from "@freshgum/typedi";
import { useRefFactory } from "@schedule/core/react/hooks";
import { useContainer } from "./use-container";

export const useService = <T>(type: ServiceIdentifier<T>): T => {
	const container = useContainer();
	return useRefFactory(() => container.get(type));
};
