import { type RefCallback, useEffect, useRef, useState } from "react";

export const useResizeObserver = <T extends HTMLElement>({
    callback,
    enable,
}: {
    enable: boolean;
    callback: (entry: ResizeObserverEntry, target: T) => void;
}): RefCallback<T> => {
    const [element, setElement] = useState<T | null>(null);

    const cb = useRef(callback);

    // eslint-disable-next-line react-hooks/refs
    cb.current = callback;

    useEffect(() => {
        if (!enable) {
            return;
        }

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
    }, [element, enable]);

    return setElement;
};
