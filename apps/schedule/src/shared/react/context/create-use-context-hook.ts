import { type Context, useContext } from "react";

export const createUseContextHook = <T>(context: Context<T | undefined>, customMessage?: string) => {
	return <OverrideContext extends T = T>() => {
		const value = useContext(context) as OverrideContext;

		if (value === null || value === undefined) {
			const message = customMessage ?? `${context.displayName} must be used within Provider`;
			throw new Error(message);
		}

		return value;
	};
};
