import { type Context, createContext } from "react";
import { createUseContextHook } from "./create-use-context-hook";

export interface CreatedContext<T> {
    Context: Context<T | undefined>;
    Provider: Context<T | undefined>["Provider"];
    useContext: () => T;
}

export const createContextWithHook = <T>(
    displayName?: string,
    errorMessage?: string,
): CreatedContext<T> => {
    const Context = createContext<T | undefined>(undefined);

    if (displayName) {
        Context.displayName = displayName;
    }

    return {
        Context,
        Provider: Context.Provider,
        useContext: createUseContextHook(Context, errorMessage),
    };
};
