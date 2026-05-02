type RequestStatus = "idle" | "requesting";
import type { RequestData } from "./types";

interface IRequestStateBase {
    requestStatus: RequestStatus;
    dataUpdatedAt: number;
}

interface IIdleRequestState extends IRequestStateBase {
    status: "pending";
    data: undefined;
    error: undefined;
    isPlaceholderData: false;
}

interface IErrorRequestState<TData> extends IRequestStateBase {
    status: "error";
    data: TData | undefined;
    error: unknown;
    isPlaceholderData: false;
}

interface ISuccessRequestState<TData> extends IRequestStateBase {
    status: "success";
    data: TData;
    error: undefined;
    isPlaceholderData: boolean;
}

export type RequestState<TData extends RequestData> =
    | IIdleRequestState
    | ISuccessRequestState<TData>
    | IErrorRequestState<TData>;
