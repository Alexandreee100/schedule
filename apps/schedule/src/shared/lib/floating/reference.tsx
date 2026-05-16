import type { ReferenceType } from "@floating-ui/react";
import { observer } from "mobx-react-lite";
import type { HTMLProps, ReactElement } from "react";

import type {
    SetReferenceType,
    WithFloatingContextHook,
} from "src/shared/lib/floating/types";

export type ReferenceProps<T extends ReferenceType> = {
    children: (
        props: Record<string, unknown> & { ref: SetReferenceType<T> },
    ) => ReactElement;
    userProps?: HTMLProps<Element>;
};

export const Reference = observer(function Reference<T extends ReferenceType>({
    children,
    userProps,
    useContextHook,
}: ReferenceProps<T> & WithFloatingContextHook<T>) {
    const ctx = useContextHook();

    const ref = ctx.refs.setReference;

    const props = ctx.getReferenceProps(userProps);

    return children({ ...props, ref });
});
