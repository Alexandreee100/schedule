export interface IIdleMutationState {
    status: "idle";
    data: undefined;
    error: undefined;
}

export interface IPendingMutationState {
    status: "pending";
    data: undefined;
    error: undefined;
}

export interface IErrorMutationState {
    status: "error";
    data: undefined;
    error: unknown;
}

export interface ISuccessMutationState<TData> {
    status: "success";
    data: TData;
    error: undefined;
}

export type MutationState<TData> =
    | IIdleMutationState
    | IPendingMutationState
    | IErrorMutationState
    | ISuccessMutationState<TData>;

export const createIdleMutationState = (): IIdleMutationState => ({
    status: "idle",
    data: undefined,
    error: undefined,
});

export const createPendingMutationState = (): IPendingMutationState => ({
    status: "pending",
    data: undefined,
    error: undefined,
});

export const createErrorMutationState = (error: unknown): IErrorMutationState => ({
    status: "error",
    data: undefined,
    error,
});

export const createSuccessMutationState = <TData>(data: TData): ISuccessMutationState<TData> => ({
    status: "success",
    error: undefined,
    data,
});
