import {
    type RetryDelayValue,
    type RetryValue,
    type IRequestControllerConfig,
    type PlaceholderDataOption,
} from "./request/request-controller";
import { createRequestClient as createRequestClientBase } from "./request/request-client";
import { InFlightRequestCache } from "./cache/inflight-request-cache";
import {
    type IDefinedObservableResource,
    type IObservableResource,
    ObservableResource,
    type EnabledOption,
    type PollIntervalOption,
} from "./request/observable-request";
import { createMobxMutationStateStore } from "./adapters/mobx-mutation-state-store";
import { ObservableMutation, type ObservableMutationConfig } from "./mutation/observable-mutation";
import { serializeRequestKey } from "./utils/serialize-request-key";
import type { RequestData, RequestKey } from "./request/types";

export type CreateObservableResourceConfig<TRequestKey extends RequestKey, TData extends RequestData> = {
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

export type CreateObservableTaskConfig<TRequestKey extends RequestKey> = {
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

    function createObservableResource<TRequestKey extends RequestKey, TData extends RequestData>(
        config: CreateObservableResourceConfig<TRequestKey, TData> & { initialData: TData }
    ): IDefinedObservableResource<TData>;
    function createObservableResource<TRequestKey extends RequestKey, TData extends RequestData>(
        config: CreateObservableResourceConfig<TRequestKey, TData>
    ): IObservableResource<TData>;
    function createObservableResource<TRequestKey extends RequestKey, TData extends RequestData>(
        config: CreateObservableResourceConfig<TRequestKey, TData>
    ) {
        return new ObservableResource({
            ...config,
            inFlightRequestCache,
            serializeRequestKey,
        });
    }

    const createObservableTask = <TRequestKey extends RequestKey>(
        config: CreateObservableTaskConfig<TRequestKey>
    ) => {
        return new ObservableResource({
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
        createObservableResource,
        createObservableTask,
        createObservableMutation,
    };
};
