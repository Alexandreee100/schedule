import { InFlightRequestCache } from "../cache/inflight-request-cache";
import { serializeRequestKey, type SerializeRequestKeyFn } from "../utils/serialize-request-key";
import { type IRequestStateStore, RequestExecutor } from "./request-executor";
import { createIdleRequestState, createSuccessRequestState, type RequestState } from "./request-state";
import type { RequestFn, RequestKey } from "./types";

export interface IInFlightRequestProvider<TData> {
    get(): { promise: Promise<TData>; unsubscribe: () => void };
}
export type PlaceholderDataFactory<TData> = (previousData: TData | undefined) => TData | undefined;
export type PlaceholderDataOption<TData> = TData | PlaceholderDataFactory<TData> | undefined;

export type RetryValue = boolean | number | ((failureCount: number, error: unknown) => boolean);
export type RetryDelayValue = number | ((failureCount: number, error: unknown) => number);

const isPlaceholderFactory = <TData>(value: PlaceholderDataOption<TData>): value is PlaceholderDataFactory<TData> =>
    typeof value === "function";

export interface IRequestControllerConfig<TRequestKey extends RequestKey, TData> {
    requestKey: () => TRequestKey;
    inFlightRequestCache: InFlightRequestCache;
    requestFn: RequestFn<TRequestKey, TData>;
    createRequestStateStore: (initialState: RequestState<TData>) => IRequestStateStore<TData>;
    serializeRequestKey?: SerializeRequestKeyFn;
    placeholderData?: PlaceholderDataOption<TData>;
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
}

export class RequestController<TRequestKey extends RequestKey, TData> {
    private requestRun: RequestExecutor<TData> | undefined;
    private serializedKey: string | undefined;

    private readonly requestStateStore;
    private readonly config;

    constructor(config: IRequestControllerConfig<TRequestKey, TData>) {
        this.config = { serializeRequestKey: serializeRequestKey, ...config };
        this.requestStateStore = config.createRequestStateStore(createIdleRequestState());
    }

    public get state() {
        return this.requestStateStore.get();
    }

    public request(): Promise<TData> {
        return this.getRequest().execute();
    }

    public cancel(): void {
        if (this.requestRun) {
            this.requestRun.cancel();
        }
    }

    private getRequest(): RequestExecutor<TData> {
        const config = this.config;
        const requestKey = config.requestKey();
        const serializedKey = config.serializeRequestKey(requestKey);

        if (this.requestRun) {
            if (this.serializedKey === serializedKey) {
                return this.requestRun;
            }

            this.requestRun.cancel();
        }

        const prevState = this.requestStateStore.get();
        const data = this.resolvePlaceholderData(this.config.placeholderData, prevState.data);

        if (data !== undefined) {
            this.requestStateStore.set(createSuccessRequestState(data, true));
        } else {
            this.requestStateStore.set(createIdleRequestState());
        }

        const inFlightPromiseProvider: IInFlightRequestProvider<TData> = {
            get: () =>
                config.inFlightRequestCache.getOrCreate(requestKey, config.requestFn, {
                    retry: config.retry,
                    retryDelay: config.retryDelay,
                }),
        };

        this.requestRun = new RequestExecutor(this.requestStateStore, inFlightPromiseProvider);
        this.serializedKey = serializedKey;

        return this.requestRun;
    }

    private resolvePlaceholderData<TData>(
        placeholderData: TData | PlaceholderDataFactory<TData> | undefined,
        previousData: TData | undefined
    ): TData | undefined {
        if (isPlaceholderFactory(placeholderData)) {
            return placeholderData(previousData);
        }

        return placeholderData;
    }
}
