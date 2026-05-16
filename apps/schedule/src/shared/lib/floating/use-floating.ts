import type { OffsetOptions } from "@floating-ui/dom";
import {
	autoUpdate,
	flip,
	type OpenChangeReason,
	offset,
	type ReferenceType,
	shift,
	size,
	type UseFloatingOptions,
	type UseFloatingReturn as UseFloatingUIReturn,
	useFloatingNodeId,
	useFloating as useFloatingUI,
} from "@floating-ui/react";
import { useControlledValue } from "@schedule/core/react";
import { useCallback, useMemo } from "react";

interface OpenStateProps {
	initialOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;
}

export interface FloatingProps
	extends Pick<UseFloatingOptions, "placement" | "middleware" | "strategy">,
		OpenStateProps {
	modal?: boolean;
	offsetOptions?: OffsetOptions;
	disableDefaultMiddleware?: boolean;
}

export interface UseFloatingReturn<TReferenceType extends ReferenceType = ReferenceType>
	extends UseFloatingUIReturn<TReferenceType> {
	modal: boolean;
	isOpen: boolean;
	onOpenChange: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;
	close: VoidFunction;
	open: VoidFunction;
	toggle: VoidFunction;
	isControlled: boolean;
}

export const useFloating = <TReferenceType extends ReferenceType>(
	props: FloatingProps,
): UseFloatingReturn<TReferenceType> => {
	const {
		open: controlledOpen,
		onOpenChange: setControlledOpen,
		initialOpen = false,
		placement,
		strategy = "fixed",
		modal = false,
		offsetOptions: initialOffsetOptions,
		disableDefaultMiddleware,
		middleware: passedMiddleware = [],
	} = props;

	const [isOpen, setOpen, isControlled] = useControlledValue({
		initialValue: initialOpen,
		controlledValue: controlledOpen,
		onChange: setControlledOpen,
	});

	const close = useCallback(() => setOpen(false), [setOpen]);
	const open = useCallback(() => setOpen(true), [setOpen]);
	const toggle = useCallback(() => setOpen((prevState) => !prevState), [setOpen]);

	const middleware = useMiddleware({
		offsetOptions: initialOffsetOptions,
		middleware: passedMiddleware,
		disableDefaultMiddleware,
	});

	const nodeId = useFloatingNodeId();

	const data = useFloatingUI<TReferenceType>({
		nodeId,
		placement,
		open: isOpen,
		onOpenChange: setOpen,
		whileElementsMounted: autoUpdate,
		strategy,
		middleware,
	});

	return useMemo(
		() => ({
			...data,
			isOpen,
			close,
			open,
			toggle,
			onOpenChange: setOpen,
			isControlled,
			modal,
		}),
		[data, isOpen, close, open, toggle, setOpen, isControlled, modal],
	);
};

const useMiddleware = ({
	disableDefaultMiddleware,
	offsetOptions: initialOffsetOptions,
	middleware: passedMiddleware = [],
}: Pick<FloatingProps, "disableDefaultMiddleware" | "offsetOptions" | "middleware">) => {
	const offsetNumber = initialOffsetOptions && typeof initialOffsetOptions === "number" ? initialOffsetOptions : 4;

	const defaultMiddleware: UseFloatingOptions["middleware"] = disableDefaultMiddleware
		? []
		: [
				offset(2),
				shift({
					padding: 2,
				}),
				flip({
					padding: 2,
				}),
				size({
					apply(args) {
						const { availableHeight, elements } = args;
						const maxHeight = availableHeight - 2;
						elements.floating.style.maxHeight = `${maxHeight}px`;
					},
				}),
			];

	const middleware: UseFloatingOptions["middleware"] = [...defaultMiddleware, ...passedMiddleware];

	return middleware;
};
