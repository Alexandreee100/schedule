import { makeAutoObservable } from "mobx";
import { RootContainer } from "@/core/di/context";
import type { ModalState } from "./types";

export class ModalManager {
    private modals = new Map<string, ModalState>();

    public constructor() {
        makeAutoObservable(this, undefined, { autoBind: true });
    }

    private get modalsList() {
        return [...this.modals.values()];
    }

    public get activeModal() {
        return this.modalsList.find(({ visibility }) => visibility);
    }

    public activateModal(id: string) {
        const activeModal = this.activeModal;

        if (activeModal) {
            activeModal.visibility = false;
        }

        const modal = this.modals.get(id);

        if (modal) {
            modal.visibility = true;
        }
    }

    public registerModal(id: string, data: Omit<ModalState, "visibility">) {
        this.modals.set(id, { ...data, visibility: false });
    }

    public unregisterModal(id: string) {
        this.modals.delete(id);

        if (!this.activeModal) {
            const lastModal = this.modalsList.at(-1);
            if (lastModal) {
                this.activateModal(lastModal.id);
            }
        }
    }

    public get(id: string) {
        return this.modals.get(id);
    }

    public has(id: string) {
        return this.modals.has(id);
    }
}

RootContainer.registerClass(ModalManager, [], "singleton");
