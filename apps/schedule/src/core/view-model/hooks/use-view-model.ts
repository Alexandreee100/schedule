import { type DependencyList, useEffect, useMemo } from "react";
import { ContainerInstance } from "@freshgum/typedi";

import { useContainer } from "../../di/hooks/use-container";
import { ViewModel } from "@schedule/core/view-model";

export const useViewModel = <T extends ViewModel>(
    factory: (container: ContainerInstance) => T,
    deps: DependencyList
): T => {
    const container = useContainer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const vm = useMemo(() => factory(container), [container, ...deps]);

    useEffect(() => {
        vm.mount();

        return () => {
            vm.unmount();
        };
    }, [vm]);

    return vm;
};
