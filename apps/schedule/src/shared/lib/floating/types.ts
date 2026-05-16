import type { ReferenceType, UseInteractionsReturn } from "@floating-ui/react";

import type { UseFloatingReturn } from "src/shared/lib/floating/use-floating";

export type SetReferenceType<T extends ReferenceType> = (ref: T | null) => void;

export type WithFloatingContextHook<T extends ReferenceType> = {
	useContextHook: () => UseFloatingReturn<T> & UseInteractionsReturn;
};
