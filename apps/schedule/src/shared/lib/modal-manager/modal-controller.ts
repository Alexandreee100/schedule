import type { ModalManager } from "src/shared/lib/modal-manager/modal-manager";
import type { getPromiseContainer } from "src/shared/lib/modal-manager/utils";

export class ModalController<Return> {
	constructor(
		private readonly id: string,
		private readonly promiseContainer: ReturnType<typeof getPromiseContainer<Return>>,
		private readonly modalManager: ModalManager,
	) {}

	public resolve = (value?: Return) => {
		this.modalManager.unregisterModal(this.id);
		this.promiseContainer.resolve(value);
	};

	public reject = (reason?: unknown) => {
		this.modalManager.unregisterModal(this.id);
		this.promiseContainer.reject(reason);
	};
}
