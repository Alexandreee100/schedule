type RequestStatus = "idle" | "requesting";

interface IIdleRequestState {
    status: "pending";
    requestStatus: RequestStatus;
    data: undefined;
    error: undefined;
    isPlaceholderData: false;
}

interface IErrorRequestState<TData> {
    status: "error";
    requestStatus: RequestStatus;
    data: TData | undefined;
    error: unknown;
    isPlaceholderData: false;
}

interface ISuccessRequestState<TData> {
    status: "success";
    requestStatus: RequestStatus;
    data: TData;
    error: undefined;
    isPlaceholderData: boolean;
}

export type RequestState<TData> = IIdleRequestState | ISuccessRequestState<TData> | IErrorRequestState<TData>;

export const createIdleRequestState = <TData>(): RequestState<TData> => ({
    status: "pending",
    requestStatus: "idle",
    data: undefined,
    error: undefined,
    isPlaceholderData: false,
});

export const createSuccessRequestState = <TData>(
    data: TData,
    isPlaceholderData: boolean = false
): RequestState<TData> => ({
    status: "success",
    requestStatus: "idle",
    data,
    error: undefined,
    isPlaceholderData,
});

export const createErrorRequestState = <TData>(error: unknown, data?: TData): RequestState<TData> => ({
    status: "error",
    requestStatus: "idle",
    data,
    error,
    isPlaceholderData: false,
});
