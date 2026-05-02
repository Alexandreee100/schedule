import { createErrorRequestState, createSuccessRequestState, type RequestState } from "./request-state";
import { BaseRequestExecutor, type IRequestPromiseProvider } from "./base-request-executor";
import type { IStateStore } from "../utils/create-state-store";

export type IRequestStateStore<TData> = Omit<IStateStore<RequestState<TData>>, "state">;

export class RequestExecutor<TData> {
    private readonly baseRequestExecutor: BaseRequestExecutor<TData>;

    constructor(private readonly stateStore: IRequestStateStore<TData>, inFlightPromiseProvider: IRequestPromiseProvider<TData>) {
        this.baseRequestExecutor = new BaseRequestExecutor(inFlightPromiseProvider, {
            onStart: () => {
                this.stateStore.set((prevState) => ({
                    ...prevState,
                    requestStatus: "requesting",
                }));
            },
            onSuccess: (data) => {
                this.stateStore.set(createSuccessRequestState(data, false));
            },
            onError: (error) => {
                this.stateStore.set((prevState) => createErrorRequestState(error, prevState.data));
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
