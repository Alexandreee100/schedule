import { FactoryCache } from "@asudd/lib/cache";
import type { RetryDelayValue, RetryValue } from "../request/request-controller";
import { executeWithRetry } from "../utils/retryer";
import type { SerializeRequestKeyFn } from "../utils/serialize-request-key";
import type { RequestKey } from "../request/types";

interface IInFlightRequestCacheEntry {
    promise: Promise<unknown>;
    abortController: AbortController;
    refCount: number;
    settled: boolean;
}

interface IRetryConfig {
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
}

export class InFlightRequestCache {
    private readonly cache = new FactoryCache<string, IInFlightRequestCacheEntry>();

    constructor(private readonly serializeRequestKey: SerializeRequestKeyFn) {}

    public getOrCreate<TRequestKey extends RequestKey, TData>(
        requestKey: TRequestKey,
        requestFn: (arg: { requestKey: TRequestKey; signal: AbortSignal }) => Promise<TData>,
        retryConfig?: IRetryConfig
    ) {
        const key = this.serializeRequestKey(requestKey);

        const entry = this.cache.getOrCreate(key, () => this.factory(requestKey, requestFn, retryConfig));

        entry.refCount += 1;

        let unsubscribed = false;

        const unsubscribe = () => {
            if (unsubscribed) {
                return;
            }

            unsubscribed = true;
            entry.refCount -= 1;

            if (entry.refCount === 0 && !entry.settled) {
                entry.abortController.abort();
                this.delete(requestKey);
            }
        };

        return {
            promise: entry.promise as Promise<TData>,
            unsubscribe,
        };
    }

    private delete(requestKey: RequestKey) {
        const key = this.serializeRequestKey(requestKey);
        this.cache.delete(key);
    }

    private factory<TRequestKey extends RequestKey, TData>(
        requestKey: TRequestKey,
        requestFn: (arg: { requestKey: TRequestKey; signal: AbortSignal }) => Promise<TData>,
        retryConfig?: IRetryConfig
    ): IInFlightRequestCacheEntry {
        const abortController = new AbortController();

        const promise = executeWithRetry({
            signal: abortController.signal,
            retry: retryConfig?.retry,
            retryDelay: retryConfig?.retryDelay,
            fn: () =>
                requestFn({
                    requestKey,
                    signal: abortController.signal,
                }),
        });

        const entry: IInFlightRequestCacheEntry = {
            promise,
            abortController,
            refCount: 0,
            settled: false,
        };

        // Не используем finally для cleanup: он не поглощает reject.
        const onSettled = () => {
            entry.settled = true;
            this.delete(requestKey);
        };

        promise.then(onSettled, onSettled);

        return entry;
    }
}
