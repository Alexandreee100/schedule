export function invariant(
    condition: unknown,
    message?: string,
): asserts condition {
    if (!condition) {
        throw new Error(message || "Invariant failed");
    }
}

export function isDefined<TValue>(value: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}

export function assertDefined<TValue>(
    value: TValue,
    message?: string,
): asserts value is NonNullable<TValue> {
    invariant(isDefined(value), message || "Value is null or undefined");
}

export function assertAndReturn<TValue>(
    value: TValue,
    message?: string,
): NonNullable<TValue> {
    assertDefined(value, message);
    return value;
}
