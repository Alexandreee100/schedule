import type { ContainerInstance } from "@freshgum/typedi";
import type { FunctionComponent } from "react";
import { ContainerProvider } from "../context";

export function withContainer<T extends {}>(Component: FunctionComponent<T>, container: ContainerInstance) {
	return function WithContainerComponent(props: T) {
		return (
			<ContainerProvider value={container}>
				<Component {...props} />
			</ContainerProvider>
		);
	};
}
