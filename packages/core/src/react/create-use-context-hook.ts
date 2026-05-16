import { type Context, useContext } from "react";

export const createUseContextHook = <T>(context: Context<T | undefined>, customMessage?: string): (() => T) => {
	return () => {
		const value = useContext(context);

		if (value === undefined) {
			const message = customMessage ?? `${context.displayName} must be used within Provider`;
			throw new Error(message);
		}

		return value;
	};
};
