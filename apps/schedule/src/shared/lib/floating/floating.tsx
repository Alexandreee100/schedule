import {
    FloatingFocusManager,
    type FloatingFocusManagerProps,
    FloatingNode,
    FloatingOverlay,
    FloatingPortal,
    type ReferenceType,
    type UseInteractionsReturn,
} from "@floating-ui/react";
import { Flex } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import type { HTMLProps, ReactNode } from "react";

import type { UseFloatingReturn } from "src/shared/lib/floating/use-floating";

export type FloatingProps<T extends ReferenceType> = Omit<
    FloatingFocusManagerProps,
    "context" | "children"
> & {
    children: ReactNode | ((ctx: UseFloatingReturn<T>) => ReactNode);
    userProps?: HTMLProps<HTMLElement>;
};

export const Floating = observer(function Floating<T extends ReferenceType>(
    props: FloatingProps<T> & {
        useContextHook: () => UseFloatingReturn<T> & UseInteractionsReturn;
    },
) {
    const { children, userProps, useContextHook, ...focusManagerProps } = props;
    const ctx = useContextHook();

    const floatingProps = ctx.getFloatingProps({
        ref: ctx.refs.setFloating,
        ...userProps,
    });

    const { style, ...restFloatingProps } = floatingProps;

    if (!ctx.context.open) return null;

    return (
        <FloatingNode id={ctx.context.nodeId}>
            <FloatingPortal>
                {ctx.modal && <FloatingOverlay />}
                <FloatingFocusManager
                    {...focusManagerProps}
                    context={ctx.context}
                    modal={ctx.modal}
                >
                    <Flex
                        direction="column"
                        style={{ ...ctx.floatingStyles, width: "fit-content" }}
                        {...restFloatingProps}
                    >
                        {typeof children === "function"
                            ? children(ctx)
                            : children}
                    </Flex>
                </FloatingFocusManager>
            </FloatingPortal>
        </FloatingNode>
    );
});
