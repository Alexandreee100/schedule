import { useRef } from "react";

export function useRefFactory<T>(factory: () => T): T {
	const ref = useRef<T>(undefined);

	if (!ref.current) {
		ref.current = factory();
	}

	return ref.current;
}
