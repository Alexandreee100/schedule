import type { ContainerInstance } from "@freshgum/typedi";
import type { ViewModel } from "@schedule/core/view-model";
import { type DependencyList, useEffect, useMemo } from "react";
import { useContainer } from "../../di/hooks/use-container";

export const useViewModel = <T extends ViewModel>(
	factory: (container: ContainerInstance) => T,
	deps: DependencyList,
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
