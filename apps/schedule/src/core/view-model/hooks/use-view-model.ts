import type { ViewModel } from "@schedule/core/view-model";
import type { Container } from "@schedule/di";
import { type DependencyList, useEffect, useMemo } from "react";
import { useContainer } from "../../di/hooks/use-container";

export const useViewModel = <T extends ViewModel>(
    factory: (container: Container) => T,
    deps: DependencyList,
): T => {
    const container = useContainer();

    const vm = useMemo(() => factory(container), [container, factory, ...deps]);

    useEffect(() => {
        vm.mount();

        return () => {
            vm.unmount();
        };
    }, [vm]);

    return vm;
};
