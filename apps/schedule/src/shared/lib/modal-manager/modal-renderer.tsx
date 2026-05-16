import {
	FloatingFocusManager,
	FloatingNode,
	FloatingOverlay,
	FloatingPortal,
	type OpenChangeReason,
	useDismiss,
	useFloating,
	useFloatingNodeId,
	useInteractions,
} from "@floating-ui/react";
import { useCallback, useEffect, useRef } from "react";
import { useMergeRefs } from "src/shared/hooks/use-merge-refs";
import styles from "src/shared/lib/modal-manager/modal-renderer.module.css";
import type { ModalState } from "src/shared/lib/modal-manager/types";

type ModalRootProps = {
	modalState: ModalState;
};

export const ModalRenderer = ({ modalState }: ModalRootProps) => {
	const { Component, props, controller, closeOnOutsideClick, timer } = modalState;

	const onOpenChange = useCallback(
		(open: boolean, event?: Event, reason?: OpenChangeReason) => {
			if (!open) {
				controller.resolve();
			}
		},
		[controller],
	);

	useEffect(() => {
		let timerId: number;

		if (timer !== Infinity) {
			timerId = setTimeout(() => {
				controller.resolve();
			}, timer);
		}

		return () => {
			clearTimeout(timerId);
		};
	}, [controller, timer]);

	const ref = useRef<HTMLDivElement | null>(null);

	const nodeId = useFloatingNodeId();

	const data = useFloating({ open: true, onOpenChange, nodeId });

	const mergedRefs = useMergeRefs([ref, data.refs.setFloating]);
	const dismiss = useDismiss(data.context, {
		outsidePress: closeOnOutsideClick,
	});
	const interactions = useInteractions([dismiss]);

	return (
		<FloatingNode id={nodeId}>
			<FloatingPortal>
				<FloatingOverlay className={styles.overlay}>
					<FloatingFocusManager context={data.context}>
						<div
							className={styles.modalWrapper}
							ref={mergedRefs}
							{...interactions.getFloatingProps()}
						>
							<Component {...props} />
						</div>
					</FloatingFocusManager>
				</FloatingOverlay>
			</FloatingPortal>
		</FloatingNode>
	);
};
