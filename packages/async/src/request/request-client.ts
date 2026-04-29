import { type RetryDelayValue, type RetryValue } from "./request-controller";
import { InFlightRequestCache } from "../cache/inflight-request-cache";
import { raceWithAbort } from "../utils/race-with-abort";
import { executeWithRetry } from "../utils/retryer";
import type { RequestFn, RequestKey } from "./types";

export interface IRequestOptions<TRequestKey extends RequestKey, TData> {
    requestKey: TRequestKey;
    requestFn: RequestFn<TRequestKey, TData>;
    signal?: AbortSignal;
    dedupe?: boolean;
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
}

export const createRequestClient = (config: { inFlightRequestCache: InFlightRequestCache }) => {
    const inFlightRequestCache = config.inFlightRequestCache;

    const makeRequest = <TRequestKey extends RequestKey, TData>(
        options: IRequestOptions<TRequestKey, TData>
    ): Promise<TData> => {
        const requestFn = () =>
            options.requestFn({
                requestKey: options.requestKey,
                signal: options.signal,
            });

        return executeWithRetry({
            signal: options.signal,
            retry: options.retry,
            retryDelay: options.retryDelay,
            fn: requestFn,
        });
    };

    const makeDedupedRequest = <TRequestKey extends RequestKey, TData>(
        options: IRequestOptions<TRequestKey, TData>
    ): Promise<TData> => {
        const entry = inFlightRequestCache.getOrCreate(
            options.requestKey,
            ({ signal, requestKey }) =>
                options.requestFn({
                    requestKey,
                    signal,
                }),
            {
                retry: options.retry,
                retryDelay: options.retryDelay,
            }
        );

        const promise = options.signal ? raceWithAbort(entry.promise, options.signal) : entry.promise;

        return promise.finally(entry.unsubscribe);
    };

    return {
        request: <TRequestKey extends RequestKey, TData>(options: IRequestOptions<TRequestKey, TData>) => {
            if (options.dedupe === false) {
                return makeRequest(options);
            }

            return makeDedupedRequest(options);
        },
    };
};
