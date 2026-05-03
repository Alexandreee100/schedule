import { type SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { usePrevious } from "./use-previous";


interface UseControlledValueProps<T, R extends unknown[]> {
    initialValue: T | (() => T);
    controlledValue?: T;
    onChange?: (value: T, ...rest: R) => void;
    enableWarning?: boolean
}

type UseControlledValueReturn<T, R extends unknown[]> = [
    value: T,
    setValue: (value: T | SetStateAction<T>, ...rest: R) => void,
    isControlled: boolean,
];

export function useControlledValue<T, R extends unknown[] = unknown[]>(
    props: UseControlledValueProps<T, R>
): UseControlledValueReturn<T, R> {
    const { initialValue, controlledValue, onChange } = props;
    const isControlled = controlledValue !== undefined;

    if (props.enableWarning) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useWarning(isControlled);
    }

    const [uncontrolledValue, setUncontrolledValue] = useState<T>(initialValue);
    const prevUncontrolledValue = usePrevious(uncontrolledValue);
    const restArgsRef = useRef<R>(undefined);

    const setValue = useCallback(
        (value: T | SetStateAction<T>, ...rest: R) => {
            restArgsRef.current = rest;

            if (isControlled) {
                const nextValue = isFunction(value) ? value(controlledValue) : value;
                if (nextValue !== controlledValue && onChange) {
                    onChange(nextValue, ...rest);
                }
            } else {
                setUncontrolledValue(value);
            }
        },
        [isControlled, controlledValue, onChange]
    );

    useEffect(() => {
        if (restArgsRef.current === undefined) return;

        const isValueChanged = prevUncontrolledValue !== uncontrolledValue;
        const shouldCall = !isControlled && onChange && isValueChanged;

        if (shouldCall) {
            onChange(uncontrolledValue, ...restArgsRef.current);
            restArgsRef.current = undefined;
        }
    }, [isControlled, onChange, prevUncontrolledValue, uncontrolledValue]);

    const value = isControlled ? controlledValue : uncontrolledValue;

    return [value, setValue, isControlled] as const;
}

const useWarning = (isControlled: boolean) => {
    const isControlledRef = useRef(isControlled);

    useEffect(() => {
        const wasControlled = isControlledRef.current;
        if (wasControlled !== isControlled) {
            const from = wasControlled ? "controlled" : "uncontrolled";
            const to = isControlled ? "controlled" : "uncontrolled";
            console.warn(
                `Changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
            );
        }
        isControlledRef.current = isControlled;
    }, [isControlled]);
};

const isFunction = <T>(action: SetStateAction<T>): action is (prev: T) => T => typeof action === "function";
