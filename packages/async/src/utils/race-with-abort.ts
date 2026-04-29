export const raceWithAbort = async <TData>(promise: Promise<TData>, signal: AbortSignal): Promise<TData> => {
    if (signal.aborted) {
        throw new CancelledError();
    }

    let onAbort = () => {};

    const abortPromise = new Promise<never>((_, reject) => {
        onAbort = () => reject(new CancelledError());
        signal.addEventListener("abort", onAbort, { once: true });
    });

    try {
        return await Promise.race([promise, abortPromise]);
    } finally {
        signal.removeEventListener("abort", onAbort);
    }
};

export class CancelledError extends Error {
    constructor() {
        super("Request was cancelled");
        this.name = "CancelledError";
    }
}
