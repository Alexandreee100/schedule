import type { IStateStore } from "../utils/create-state-store";
import type { RetryDelayValue, RetryValue } from "../request/request-controller";
import { executeWithRetry } from "../utils/retryer";
import {
    createErrorMutationState,
    createIdleMutationState,
    createPendingMutationState,
    createSuccessMutationState,
    type MutationState,
} from "./mutation-state";

type OnMutateCallback<TMutationFnArg, TOnMutateResult> = (
    arg: TMutationFnArg
) => Promise<TOnMutateResult> | TOnMutateResult;

type OnSuccessCallback<TData, TMutationFnArg, TOnMutateResult> = (
    data: TData,
    arg: TMutationFnArg,
    onMutateResult: TOnMutateResult | undefined
) => Promise<void> | void;

type OnSettledCallback<TData, TMutationFnArg, TOnMutateResult> = (
    data: TData | undefined,
    error: unknown | undefined,
    arg: TMutationFnArg,
    onMutateResult: TOnMutateResult | undefined
) => Promise<void> | void;

type OnErrorCallback<TMutationFnArg, TOnMutateResult> = (
    error: unknown,
    arg: TMutationFnArg,
    onMutateResult: TOnMutateResult | undefined
) => Promise<void> | void;

export interface IMutationExecutorCallbacks<TData, TMutationFnArg, TOnMutateResult = unknown> {
    onSuccess?: OnSuccessCallback<TData, TMutationFnArg, TOnMutateResult>;
    onError?: OnErrorCallback<TMutationFnArg, TOnMutateResult>;
    onSettled?: OnSettledCallback<TData, TMutationFnArg, TOnMutateResult>;
}

export interface IMutationExecutorConfig<TData, TMutationFnArg, TOnMutateResult = unknown>
    extends IMutationExecutorCallbacks<TData, TMutationFnArg, TOnMutateResult> {
    mutationFn: (arg: TMutationFnArg) => Promise<TData>;
    onMutate?: OnMutateCallback<TMutationFnArg, TOnMutateResult>;
    retry?: RetryValue;
    retryDelay?: RetryDelayValue;
}

export class MutationExecutor<TData, TMutationFnArg, TOnMutateResult = unknown> {
    private token: symbol | undefined = undefined;

    constructor(
        private readonly state: IStateStore<MutationState<TData>>,
        private readonly config: IMutationExecutorConfig<TData, TMutationFnArg, TOnMutateResult>
    ) {}

    public async execute(
        arg: TMutationFnArg,
        options: IMutationExecutorCallbacks<TData, TMutationFnArg, TOnMutateResult> = {}
    ): Promise<TData> {
        const token = Symbol();
        this.token = token;

        this.state.set(createPendingMutationState());

        let onMutateResult: TOnMutateResult | undefined;

        try {
            onMutateResult = await this.config.onMutate?.(arg);

            const data = await executeWithRetry({
                fn: () => this.config.mutationFn(arg),
                retry: this.config.retry ?? 0,
                retryDelay: this.config.retryDelay,
            });

            if (this.token === token) {
                this.state.set(createSuccessMutationState(data));
            }

            await this.config.onSuccess?.(data, arg, onMutateResult);
            await this.config.onSettled?.(data, undefined, arg, onMutateResult);

            if (this.token === token) {
                await options.onSuccess?.(data, arg, onMutateResult);
                await options.onSettled?.(data, undefined, arg, onMutateResult);
            }

            return data;
        } catch (error) {
            if (this.token === token) {
                this.state.set(createErrorMutationState(error));
            }

            await this.config.onError?.(error, arg, onMutateResult);
            await this.config.onSettled?.(undefined, error, arg, onMutateResult);

            if (this.token === token) {
                await options.onError?.(error, arg, onMutateResult);
                await options.onSettled?.(undefined, error, arg, onMutateResult);
            }

            throw error;
        } finally {
            if (this.token === token) {
                this.token = undefined;
            }
        }
    }

    public reset() {
        this.token = undefined;
        this.state.set(createIdleMutationState());
    }
}
