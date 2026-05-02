import { InFlightRequestCache } from "../cache/inflight-request-cache";
import { serializeRequestKey, type SerializeRequestKeyFn } from "../utils/serialize-request-key";
import { type IRequestStateStore, RequestExecutor } from "./request-executor";
import { type RequestState } from "./request-state";
import type { RequestData, RequestFn, RequestKey } from "./types";

export interface IInFlightRequestProvider<TData> {
    get(): { promise: Promise<TData>; unsubscribe: () => void };
}
export type PlaceholderDataFactory<TData> = (previousData: TData | undefined) => TData | undefined;
export type PlaceholderDataOption<TData> = TData | PlaceholderDataFactory<TData> | undefined;

export type RetryValue = boolean | number | ((failureCount: number, error: unknown) => boolean);
export type RetryDelayValue = number | ((failureCount: number, error: unknown) => number);

const isPlaceholderFactory = <TData>(value: PlaceholderDataOption<TData>): value is PlaceholderDataFactory<TData> =>
    typeof value === "function";

export interface IRequestControllerConfig<TRequestKey extends RequestKey, TData extends RequestData> {
    requestKey: () => TRequestKey;
    inFlightRequestCache: InFlightRequestCache;
    requestFn: RequestFn<TRequestKey, TData>;
    createRequestStateStore: (initialState: RequestState<TData>) => IRequestStateStore<TData>;
    serializeRequestKey?: SerializeRequestKeyFn;
    placeholderData?: PlaceholderDataOption<TData>;
    initialData?: TData;
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
}

export class RequestController<TRequestKey extends RequestKey, TData extends RequestData> {
    private requestRun: RequestExecutor<TData> | undefined;
    private serializedKey: string | undefined;

    private readonly requestStateStore;
    private readonly config;

    constructor(config: IRequestControllerConfig<TRequestKey, TData>) {
        this.config = { serializeRequestKey: serializeRequestKey, ...config };
        const initialState: RequestState<TData> =
            config.initialData !== undefined
                ? {
                      status: "success",
                      requestStatus: "idle",
                      data: config.initialData,
                      error: undefined,
                      isPlaceholderData: false,
                      dataUpdatedAt: 0,
                  }
                : {
                      status: "pending",
                      requestStatus: "idle",
                      data: undefined,
                      error: undefined,
                      isPlaceholderData: false,
                      dataUpdatedAt: 0,
                  };
        this.requestStateStore = config.createRequestStateStore(initialState);
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

        const isKeyChanged = this.serializedKey !== undefined && this.serializedKey !== serializedKey;

        if (this.requestRun) {
            if (!isKeyChanged) {
                return this.requestRun;
            }

            this.requestRun.cancel();
        }

        if (isKeyChanged) {
            this.requestStateStore.set((prevState) => {
                const data = this.resolvePlaceholderData(this.config.placeholderData, prevState.data);

                return data !== undefined
                    ? {
                          status: "success",
                          requestStatus: "idle",
                          data,
                          error: undefined,
                          isPlaceholderData: true,
                          dataUpdatedAt: prevState.dataUpdatedAt,
                      }
                    : {
                          status: "pending",
                          requestStatus: "idle",
                          data: undefined,
                          error: undefined,
                          isPlaceholderData: false,
                          dataUpdatedAt: prevState.dataUpdatedAt,
                      };
            });
        }

        const inFlightPromiseProvider: IInFlightRequestProvider<TData> = {
            get: () =>
                config.inFlightRequestCache.getOrCreate(requestKey, config.requestFn, {
                    retry: config.retry,
                    retryDelay: config.retryDelay,
                }),
        };

        const requestRun = new RequestExecutor(this.requestStateStore, inFlightPromiseProvider);
        this.requestRun = requestRun;
        this.serializedKey = serializedKey;

        return requestRun;
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
