import { createContext, type PropsWithChildren, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseContextHook } from "../create-use-context-hook";

// Пересечение с object, чтобы не требовать обязательную реализацию из-за weak-type
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#weak-type-detection
export type Destroyable = object & { destroy?: () => void; mount?: () => void };

export const createViewModelContext = <VM extends Destroyable, Props extends object>(
    useViewModelFactory: (props: Props) => VM,
    contextName?: string
) => {
    const Context = createContext<VM | undefined>(undefined);

    const Provider = observer((props: PropsWithChildren<Props>) => {
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
