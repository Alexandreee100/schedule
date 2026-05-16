import type { AnyQueryClient } from "mobx-tanstack-query";
import { createContext, type ReactNode } from "react";
import { createUseContextHook } from "src/react";

export const createQueryContext = <T extends AnyQueryClient = AnyQueryClient>() => {
	const Context = createContext<T | undefined>(undefined);

	const useQueryContext = createUseContextHook(Context);

	const Provider = ({ children, queryClient }: { children: ReactNode; queryClient: T }) => {
		return <Context.Provider value={queryClient}>{children}</Context.Provider>;
	};

	return [Provider, useQueryContext] as const;
};
