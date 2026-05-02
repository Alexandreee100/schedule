import {
    type RetryDelayValue,
    type RetryValue,
    type IRequestControllerConfig,
    type PlaceholderDataOption,
} from "./request/request-controller";
import { createRequestClient as createRequestClientBase } from "./request/request-client";
import { InFlightRequestCache } from "./cache/inflight-request-cache";
import {
    type IDefinedObservableRequest,
    type IObservableRequest,
    ObservableRequest,
    type EnabledOption,
    type PollIntervalOption,
} from "./request/observable-request";
import { createMobxMutationStateStore } from "./adapters/mobx-mutation-state-store";
import { ObservableMutation, type ObservableMutationConfig } from "./mutation/observable-mutation";
import { serializeRequestKey } from "./utils/serialize-request-key";
import type { RequestData, RequestKey } from "./request/types";

export type CreateObservableRequestConfig<TRequestKey extends RequestKey, TData extends RequestData> = {
    requestKey: () => TRequestKey;
    requestFn: IRequestControllerConfig<TRequestKey, TData>["requestFn"];
    placeholderData?: PlaceholderDataOption<TData>;
    initialData?: TData;
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
    enableOnDemand?: boolean;
    enabled?: EnabledOption;
    pollInterval?: PollIntervalOption;
};

export type CreateObservableAsyncTaskConfig<TRequestKey extends RequestKey> = {
    requestKey: () => TRequestKey;
    requestFn: IRequestControllerConfig<TRequestKey, void>["requestFn"];
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
    enabled?: EnabledOption;
    pollInterval?: PollIntervalOption;
};

export type CreateObservableMutationConfig<TData, TMutationFnArg, TOnMutateResult = unknown> = Omit<
    ObservableMutationConfig<TData, TMutationFnArg, TOnMutateResult>,
    "createMutationStateStore"
>;

export const createAsyncApi = () => {
    const inFlightRequestCache = new InFlightRequestCache(serializeRequestKey);

    const createRequestClient = () => {
        return createRequestClientBase({
            inFlightRequestCache,
        });
    };

    function createObservableRequest<TRequestKey extends RequestKey, TData extends RequestData>(
        config: CreateObservableRequestConfig<TRequestKey, TData> & { initialData: TData }
    ): IDefinedObservableRequest<TData>;
    function createObservableRequest<TRequestKey extends RequestKey, TData extends RequestData>(
        config: CreateObservableRequestConfig<TRequestKey, TData>
    ): IObservableRequest<TData>;
    function createObservableRequest<TRequestKey extends RequestKey, TData extends RequestData>(
        config: CreateObservableRequestConfig<TRequestKey, TData>
    ) {
        return new ObservableRequest({
            ...config,
            inFlightRequestCache,
            serializeRequestKey,
        });
    }

    const createObservableAsyncTask = <TRequestKey extends RequestKey>(
        config: CreateObservableAsyncTaskConfig<TRequestKey>
    ) => {
        return new ObservableRequest({
            ...config,
            enableOnDemand: false,
            inFlightRequestCache,
            serializeRequestKey,
        });
    };

    const createObservableMutation = <TData = unknown, TMutationFnArg = void, TOnMutateResult = unknown>(
        config: CreateObservableMutationConfig<TData, TMutationFnArg, TOnMutateResult>
    ) => {
        return new ObservableMutation({
            ...config,
            createMutationStateStore: createMobxMutationStateStore,
        });
    };

    return {
        createRequestClient,
        createObservableRequest,
        createObservableAsyncTask,
        createObservableMutation,
    };
};
