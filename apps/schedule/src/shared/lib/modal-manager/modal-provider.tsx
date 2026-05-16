import { observer } from "mobx-react-lite";
import { createContext, useContext } from "react";
import { useService } from "src/core/di/hooks/use-service";
import { ModalManager } from "src/shared/lib/modal-manager/modal-manager";
import { ModalRenderer } from "src/shared/lib/modal-manager/modal-renderer";
import type { ModalContextValue } from "src/shared/lib/modal-manager/types";

const ModalContext = createContext<ModalContextValue<unknown> | null>(null);

export const ModalProvider = observer(function ModalContainer() {
	const manager = useService(ModalManager);

	const activeModalState = manager.activeModal;

	if (activeModalState) {
		return (
			<ModalContext.Provider value={activeModalState}>
				<ModalRenderer modalState={activeModalState} />
			</ModalContext.Provider>
		);
	}

	return null;
});

export function useModalContext<Return>() {
	const context = useContext(ModalContext);

	if (!context) {
		throw new Error(`useModalContext must be used within <ModalProvider>`);
	}

	return context as ModalContextValue<Return>;
}
