import type { ReferenceType, UseInteractionsReturn } from "@floating-ui/react";
import { createContext, type ReactNode, useContext } from "react";

import { Floating, type FloatingProps } from "src/shared/lib/floating/floating";
import {
    Reference,
    type ReferenceProps,
} from "src/shared/lib/floating/reference";
import type { UseFloatingReturn } from "src/shared/lib/floating/use-floating";

export const createFloatingComponents = <TProps,>(
    hook: (props: TProps) => UseFloatingReturn & UseInteractionsReturn,
) => {
    const context = createContext<
        (UseFloatingReturn & UseInteractionsReturn) | null
    >(null);

    const Provider = (props: TProps & { children: ReactNode }) => {
        const contextValue = hook(props);

        return (
            <context.Provider value={contextValue}>
                {props.children}
            </context.Provider>
        );
    };

    const useContextHook = <T extends ReferenceType>() => {
        const value = useContext(context);

        if (!value) {
            throw new Error(`useContextHook must be used within Provider`);
        }

        return value as UseFloatingReturn<T> & UseInteractionsReturn;
    };

    const useOpenState = () => {
        const { close, open, isOpen, toggle } = useContextHook();

        return {
            close,
            open,
            isOpen,
            toggle,
        };
    };

    const ReferenceComponent = <T extends ReferenceType>(
        props: ReferenceProps<T>,
    ) => {
        return <Reference useContextHook={useContextHook} {...props} />;
    };

    const FloatingComponent = <T extends ReferenceType>(
        props: FloatingProps<T>,
    ) => {
        return <Floating useContextHook={useContextHook} {...props} />;
    };

    return [
        Provider,
        ReferenceComponent,
        FloatingComponent,
        useOpenState,
        useContextHook,
    ] as const;
};
