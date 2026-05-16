import type { ContainerInstance } from "@freshgum/typedi";
import type { ViewModel } from "@schedule/core/view-model";
import { type DependencyList, useEffect, useMemo } from "react";
import { useContainer } from "../../di/hooks/use-container";

export const useViewModel = <T extends ViewModel>(
    factory: (container: ContainerInstance) => T,
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
