import type { Container } from "@schedule/di";
import type { FunctionComponent, ReactNode } from "react";
import { withContainer } from "@/core/di/hoc/with-container";
import type { PromiseContainer } from "./types";

export function wrapModal<T extends object = object>(
    Component: FunctionComponent<T>,
    scope?: Container,
): (props: T) => ReactNode | Promise<ReactNode> {
    if (scope) {
        return withContainer(Component, scope);
    }

    return Component;
}

export function getPromiseContainer<ReturnType>() {
    const promiseContainer = {
        promise: {},
        resolve: {},
        reject: {},
    } as PromiseContainer<ReturnType | undefined>;

    promiseContainer.promise = new Promise<ReturnType | undefined>(
        (resolve, reject) => {
            promiseContainer.reject = reject;
            promiseContainer.resolve = resolve;
        },
    );

    return promiseContainer;
}
