import { Container, type ContainerInstance } from "@freshgum/typedi";
import { assertAndReturn } from "@schedule/core/asserts";
import type { FunctionComponent } from "react";
import type { RequiredKeysOf } from "type-fest";
import { ModalController } from "./modal-controller";
import { ModalManager } from "./modal-manager";
import type { ModalState } from "./types";
import { getPromiseContainer, wrapModal } from "./utils";

type ShowFnProps<Props extends object> =
    RequiredKeysOf<Props> extends never ? Partial<Props> | void : Props;
type ShowFnOptions = { scope?: ContainerInstance };

export interface ICreateModalOptions {
    id: string;
    scope?: ContainerInstance;
    closeOnOutsideClick?: boolean;
    timer?: number;
}

interface ISharedModalSettings {
    scope?: ContainerInstance;
    closeOnOutsideClick?: boolean;
    timer?: number;
}

export interface ICreateModalFactoryOptions extends ISharedModalSettings {
    id: string;
}

export const createModalFactory = <Props extends object, Return = unknown>(
    Component: FunctionComponent<Props>,
    options: ICreateModalFactoryOptions,
) => {
    const { id, ...defaultOptions } = options;

    const isIdDefined = id !== "";

    if (!isIdDefined) {
        throw new Error(`Cannot create Modal with id "${id}"`);
    }

    const factoryFn = (options: ISharedModalSettings = {}) => {
        const modalManager = Container.get(ModalManager);
        const {
            closeOnOutsideClick = false,
            scope,
            timer = Infinity,
        } = { ...defaultOptions, ...options };

        const show = (
            props: ShowFnProps<Props>,
            options: ShowFnOptions = {},
        ) => {
            const actualScope = options.scope ?? scope;
            const ScopedComponent = wrapModal(Component, actualScope);

            if (modalManager.has(id)) {
                const modal = assertAndReturn(modalManager.get(id));
                return modal.promise as Promise<Return | undefined>;
            }

            const promiseContainer = getPromiseContainer<Return>();
            const controller = new ModalController(
                id,
                promiseContainer,
                modalManager,
            );

            const data = {
                id,
                visibility: false,
                promise: promiseContainer.promise,
                props,
                Component: ScopedComponent,
                controller,
                closeOnOutsideClick,
                timer,
            } satisfies ModalState;

            modalManager.registerModal(id, data);
            modalManager.activateModal(id);

            return promiseContainer.promise;
        };

        const close = () => {
            const modal = modalManager.get(id);

            if (modal) {
                modal.controller.resolve();
            }
        };

        return {
            show,
            close,
        };
    };

    return {
        create: factoryFn,
    };
};
