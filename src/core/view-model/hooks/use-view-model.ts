import { useEffect, useMemo } from "react";
import { ContainerInstance } from "@freshgum/typedi";

import { ViewModel } from "../view-model";
import { useContainer } from "../../di/hooks/use-container";

export const useViewModel = <T extends ViewModel>(
    factory: (container: ContainerInstance) => T,
    deps: readonly unknown[] = []
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
