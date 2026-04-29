import type { RetryDelayValue, RetryValue } from "../request/request-controller";
import { CancelledError } from "./race-with-abort";

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30_000;

export interface IRetryerConfig<TData> {
    fn: () => Promise<TData>;
    signal?: AbortSignal;
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
}

export const executeWithRetry = async <TData>(config: IRetryerConfig<TData>): Promise<TData> => {
    const { fn, signal, retry, retryDelay } = config;
    let failureCount = 0;

    const shouldRetry = (error: unknown) => {
        if (retry === false) {
            return false;
        }

        if (retry === true) {
            return true;
        }

        if (typeof retry === "number") {
            return failureCount < retry;
        }

        if (typeof retry === "function") {
            return retry(failureCount, error);
        }

        return failureCount < DEFAULT_RETRY_COUNT;
    };

    const resolveRetryDelay = (error: unknown) => {
        if (typeof retryDelay === "function") {
            return retryDelay(failureCount, error);
        }

        if (typeof retryDelay === "number") {
            return retryDelay;
        }

        return Math.min(DEFAULT_RETRY_DELAY_MS * 2 ** failureCount, MAX_RETRY_DELAY_MS);
    };

    const waitForRetry = (delay: number) => {
        if (delay <= 0) {
            if (signal?.aborted) {
                return Promise.reject(new CancelledError());
            }

            return Promise.resolve();
        }

        if (!signal) {
            return new Promise<void>((resolve) => {
                setTimeout(resolve, delay);
            });
        }

        return new Promise<void>((resolve, reject) => {
            const onAbort = () => {
                clearTimeout(timeoutId);
                signal.removeEventListener("abort", onAbort);
                reject(new CancelledError());
            };

            const timeoutId = setTimeout(() => {
                signal.removeEventListener("abort", onAbort);
                resolve();
            }, delay);

            signal.addEventListener("abort", onAbort, { once: true });
        });
    };

    while (true) {
        if (signal?.aborted) {
            throw new CancelledError();
        }

        try {
            return await fn();
        } catch (error) {
            if (signal?.aborted || error instanceof CancelledError) {
                throw error;
            }

            if (!shouldRetry(error)) {
                throw error;
            }

            await waitForRetry(resolveRetryDelay(error));
            failureCount += 1;
        }
    }
};
