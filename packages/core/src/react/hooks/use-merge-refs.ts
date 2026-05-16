import { isDefined } from "@schedule/core/asserts";
import { type ForwardedRef, type RefCallback, useMemo } from "react";

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
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    return useMemo(() => mergeRefs(...refs), refs);
};
