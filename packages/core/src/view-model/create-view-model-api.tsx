import { createContext, type PropsWithChildren, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { invariant } from "../asserts";
import { createUseContextHook } from "@schedule/react";

// Пересечение с object, чтобы не требовать обязательную реализацию из-за weak-type
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#weak-type-detection
export type Destroyable = object & { destroy?: () => void; mount?: () => void };
export type NestedProviderStrategy = "allow" | "throw";
export type CreateViewModelContextOptions = {
    nestedProviderStrategy?: NestedProviderStrategy;
};

export const createViewModelContext = <VM extends Destroyable, Props extends object>(
    useViewModelFactory: (props: Props) => VM,
    contextName?: string,
    options: {
        nestedProviderStrategy?: NestedProviderStrategy;
    } = {}
) => {
    const nestedProviderStrategy = options.nestedProviderStrategy ?? "allow";

    const Context = createContext<VM | undefined>(undefined);

    const Provider = observer((props: PropsWithChildren<Props>) => {
        const parentContext = useContext(Context);

        // Prevent accidental duplicate VM instances in the same React subtree.
        if (nestedProviderStrategy === "throw") {
            invariant(
                parentContext === undefined,
                contextName
                    ? `${contextName} provider is already mounted above this component.`
                    : "ViewModel provider is already mounted above this component."
            );
        }

        const vm = useViewModelFactory(props);

        useEffect(() => {
            vm.mount?.();

            return () => {
                vm.destroy?.();
            };
        }, [vm]);

        return <Context.Provider value={vm}>{props.children}</Context.Provider>;
    });

    if (contextName) {
        Context.displayName = contextName;
    }

    const useContextHook = createUseContextHook(Context);

    return [Provider, useContextHook] as const;
};
