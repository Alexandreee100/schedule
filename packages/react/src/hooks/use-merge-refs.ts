import { type ForwardedRef, type RefCallback, useMemo } from "react";
import { isDefined } from "@schedule/core/asserts";

export type ReactRef<T> = ForwardedRef<T> | undefined;

export function mergeRefs<T>(...refs: ReactRef<T>[]): RefCallback<T> {
    return (value) => {
        for (const ref of refs) {
            if (!isDefined(ref)) continue;

            if (typeof ref === "function") {
                ref(value);
            } else {
                ref.current = value;
            }
        }
    };
}

export const useMergeRefs = <T>(refs: ReactRef<T>[]) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => mergeRefs(...refs), refs);
};
