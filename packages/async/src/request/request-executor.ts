import { createErrorRequestState, createSuccessRequestState, type RequestState } from "./request-state";
import { CancelledError, raceWithAbort } from "../utils/race-with-abort";
import type { IInFlightRequestProvider } from "./request-controller";
import type { IStateStore } from "../utils/create-state-store";

export type IRequestStateStore<TData> = Omit<IStateStore<RequestState<TData>>, "state">;

export class RequestExecutor<TData> {
    private token: symbol | undefined = undefined;
    private promise: Promise<TData> | undefined = undefined;
    private abortController: AbortController | undefined = undefined;
    private unsubscribe: (() => void) | undefined = undefined;

    constructor(
        private readonly stateStore: IRequestStateStore<TData>,
        private readonly inFlightPromiseProvider: IInFlightRequestProvider<TData>
    ) {}

    public execute(): Promise<TData> {
        if (this.promise) {
            return this.promise;
        }

        const activePromise = this._execute();
        this.promise = activePromise;

        return activePromise;
    }

    private async _execute(): Promise<TData> {
        const token = Symbol();
        this.token = token;
        const abortController = new AbortController();
        this.abortController = abortController;

        this.stateStore.set((prevState) => ({
            ...prevState,
            requestStatus: "requesting",
        }));

        try {
            const cacheEntry = this.inFlightPromiseProvider.get();

            this.unsubscribe = cacheEntry.unsubscribe;

            const data = await raceWithAbort(cacheEntry.promise, abortController.signal);

            if (this.token === token) {
                this.stateStore.set(createSuccessRequestState(data, false));
            }

            return data;
        } catch (error) {
            if (error instanceof CancelledError) {
                throw error;
            }

            if (this.token === token) {
                this.stateStore.set((prevState) => createErrorRequestState(error, prevState.data));
            }

            throw error;
        } finally {
            if (this.token === token) {
                this.clearActiveRun();
            }
        }
    }

    private clearActiveRun() {
        this.token = undefined;
        this.promise = undefined;
        this.abortController = undefined;
        this.unsubscribe = undefined;
    }

    public cancel() {
        if (this.token) {
            const abortController = this.abortController;
            const unsubscribe = this.unsubscribe;

            this.clearActiveRun();

            this.stateStore.set((prevState) => ({ ...prevState, requestStatus: "idle" }));

            abortController?.abort();
            unsubscribe?.();
        }
    }
}
