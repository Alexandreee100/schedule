import type { RequestState } from "./request-state";
import type { IStateStore } from "../utils/create-state-store";
import type { RequestData } from "./types";
import { BaseRequestExecutor, type IRequestPromiseProvider } from "./base-request-executor";

export type IRequestStateStore<TData extends RequestData> = Omit<IStateStore<RequestState<TData>>, "state">;

export class RequestExecutor<TData extends RequestData> {
    private readonly baseRequestExecutor: BaseRequestExecutor<TData>;

    constructor(
        private readonly stateStore: IRequestStateStore<TData>,
        inFlightPromiseProvider: IRequestPromiseProvider<TData>
    ) {
        this.baseRequestExecutor = new BaseRequestExecutor(inFlightPromiseProvider, {
            onStart: () => {
                this.stateStore.set((prevState) => ({
                    ...prevState,
                    requestStatus: "requesting",
                }));
            },
            onSuccess: (data) => {
                this.stateStore.set({
                    status: "success",
                    requestStatus: "idle",
                    data,
                    error: undefined,
                    isPlaceholderData: false,
                    dataUpdatedAt: Date.now(),
                });
            },
            onError: (error) => {
                this.stateStore.set((prevState) => {
                    return {
                        ...prevState,
                        status: "error",
                        requestStatus: "idle",
                        error,
                        isPlaceholderData: false,
                    };
                });
            },
            onCancel: () => {
                this.stateStore.set((prevState) => ({ ...prevState, requestStatus: "idle" }));
            },
        });
    }

    public execute(): Promise<TData> {
        return this.baseRequestExecutor.execute();
    }

    public cancel() {
        this.baseRequestExecutor.cancel();
    }
}
