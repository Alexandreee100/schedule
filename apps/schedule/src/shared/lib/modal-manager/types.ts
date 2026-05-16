import type { ReactNode } from "react";

import type { ModalController } from "src/shared/lib/modal-manager/modal-controller";

type ResolveFn<T> = (value: T) => void;
type RejectFn = (reason?: unknown) => void;

export type ModalContextValue<Return> = {
    controller: ModalController<Return>;
};

export type ModalState = {
    id: string;
    visibility: boolean;
    promise: Promise<unknown>;
    controller: ModalController<any>;
    props?: any;
    closeOnOutsideClick?: boolean;
    Component: (props: any) => ReactNode | Promise<ReactNode>;
    timer: number;
};

export type PromiseContainer<ReturnType> = {
    resolve: ResolveFn<ReturnType | undefined>;
    reject: RejectFn;
    promise: Promise<ReturnType | undefined>;
};

export enum ConfirmResult {
    NO = "No",
    YES = "Yes",
}
