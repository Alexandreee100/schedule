import { CancelledError, raceWithAbort } from "../utils/race-with-abort";
import type { RequestData } from "./types";


export interface IRequestPromiseProvider<TData extends RequestData> {
    get(): { promise: Promise<TData>; unsubscribe: () => void };
}

export interface IBaseRequestExecutorHandlers<TData extends RequestData> {
    onStart?: () => void;
    onSuccess?: (data: TData) => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
}

export class BaseRequestExecutor<TData extends RequestData> {
    private token: symbol | undefined = undefined;
    private promise: Promise<TData> | undefined = undefined;
    private abortController: AbortController | undefined = undefined;
    private unsubscribe: (() => void) | undefined = undefined;

    constructor(
        private readonly promiseProvider: IRequestPromiseProvider<TData>,
        private readonly handlers: IBaseRequestExecutorHandlers<TData> = {}
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

        this.handlers.onStart?.();

        try {
            const cacheEntry = this.promiseProvider.get();

            this.unsubscribe = cacheEntry.unsubscribe;

            const data = await raceWithAbort(cacheEntry.promise, abortController.signal);

            if (this.token === token) {
                this.handlers.onSuccess?.(data);
            }

            return data;
        } catch (error) {
            if (error instanceof CancelledError) {
                throw error;
            }

            if (this.token === token) {
                this.handlers.onError?.(error);
            }

            throw error;
        } finally {
            if (this.token === token) {
                this.clearActiveRun();
            }
        }
    }

    public cancel() {
        if (!this.token) {
            return;
        }

        const abortController = this.abortController;
        const unsubscribe = this.unsubscribe;

        this.clearActiveRun();
        this.handlers.onCancel?.();

        abortController?.abort();
        unsubscribe?.();
    }

    private clearActiveRun() {
        this.token = undefined;
        this.promise = undefined;
        this.abortController = undefined;
        this.unsubscribe = undefined;
    }
}
