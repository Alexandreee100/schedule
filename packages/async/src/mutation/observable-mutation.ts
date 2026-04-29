import { MutationExecutor, type IMutationExecutorConfig, type IMutationExecutorCallbacks } from "./mutation-executor";
import type { IStateStore } from "../utils/create-state-store";
import { createIdleMutationState, type MutationState } from "./mutation-state";

export type CreateMutationStateStore<TData> = (initialState: MutationState<TData>) => IStateStore<MutationState<TData>>;

export type ObservableMutationConfig<TData, TMutationFnArg, TOnMutateResult = unknown> = IMutationExecutorConfig<
    TData,
    TMutationFnArg,
    TOnMutateResult
> & {
    createMutationStateStore: CreateMutationStateStore<TData>;
};

export class ObservableMutation<TData, TMutationFnArg, TOnMutateResult = unknown> {
    private readonly stateStore: IStateStore<MutationState<TData>>;
    private readonly executor: MutationExecutor<TData, TMutationFnArg, TOnMutateResult>;

    constructor(config: ObservableMutationConfig<TData, TMutationFnArg, TOnMutateResult>) {
        const { createMutationStateStore, ...executorConfig } = config;

        this.stateStore = createMutationStateStore(createIdleMutationState());
        this.executor = new MutationExecutor(this.stateStore, executorConfig);
    }

    public get state() {
        return this.stateStore.get();
    }

    public get isIdle() {
        return this.state.status === "idle";
    }

    public get isPending() {
        return this.state.status === "pending";
    }

    public get isSuccessful() {
        return this.state.status === "success";
    }

    public get isError() {
        return this.state.status === "error";
    }

    public get data() {
        return this.state.data;
    }

    public get error() {
        return this.state.error;
    }

    public mutate(args: TMutationFnArg, options?: IMutationExecutorCallbacks<TData, TMutationFnArg, TOnMutateResult>) {
        return this.executor.execute(args, options);
    }

    public reset() {
        this.executor.reset();
    }
}
