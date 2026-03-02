import { useLayoutEffect, useState, type RefCallback, useRef } from "react";

export const useResizeObserver = <T extends HTMLElement>(
    callback: (entry: ResizeObserverEntry, target: T) => void
): RefCallback<T> => {
    const [element, setElement] = useState<T | null>(null);

    const cb = useRef(callback);
    cb.current = callback;

    useLayoutEffect(() => {
        if (!element) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];

            if (entry) {
                cb.current(entry, element);
            }
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element]);

    return setElement;
};
