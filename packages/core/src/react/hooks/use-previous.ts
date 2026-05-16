import { useEffect, useRef } from "react";

export const usePrevious = <T>(value: T) => {
    const previousValue = useRef<T | undefined>(undefined);

    useEffect(() => {
        previousValue.current = value;
    }, [value]);

    return previousValue.current;
};
