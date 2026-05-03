
import { comparer, reaction } from "mobx";
import { type IRequestControllerConfig, RequestController } from "./request-controller";
import { createMobxRequestStateStore } from "../adapters/mobx-request-state-store";
import { CancelledError } from "../utils/race-with-abort";
import type { RequestState } from "./request-state";

import type { RequestData, RequestKey } from "./types";
import { DisposableController } from "@schedule/core/disposable-controller";

export type EnabledOption = boolean | (() => boolean);
export type PollIntervalOption = number | false | (() => number | false | undefined);

export type ObservableResourceConfig<TRequestKey extends RequestKey, TData extends RequestData> = Omit<
    IRequestControllerConfig<TRequestKey, TData>,
    "createRequestStateStore"
> & {
    enableOnDemand?: boolean;
    enabled?: EnabledOption;
    pollInterval?: PollIntervalOption;
};

export interface IObservableResource<TData extends RequestData> {
    readonly state: RequestState<TData>;
    readonly isSuccessful: boolean;
    readonly isError: boolean;
    readonly isPending: boolean;
    readonly requestStatus: RequestState<TData>["requestStatus"];
    readonly isIdle: boolean;
    readonly isPlaceholderData: boolean;
    readonly isRequesting: boolean;
    readonly error: unknown;
    readonly data: TData | undefined;
    readonly dataUpdatedAt: number;
    request: () => Promise<TData>;
    cancel: () => void;
    destroy: () => void;
}

export interface IDefinedObservableResource<TData extends RequestData> extends Omit<IObservableResource<TData>, "data"> {
    readonly data: TData;
}

export class ObservableResource<TRequestKey extends RequestKey, TData extends RequestData> {
    private readonly requestController: RequestController<TRequestKey, TData>;
    private readonly reactionDisposers = new DisposableController();

    private isSubscribed = false;
    private readonly enableOnDemand;
    private readonly enabled;
    private readonly pollInterval;
    private readonly requestKey;
    private pollIntervalDisposer = new DisposableController();

    constructor(config: ObservableResourceConfig<TRequestKey, TData>) {
        const { enableOnDemand = true, enabled = true, pollInterval = false, requestKey, ...controllerConfig } = config;

        this.requestController = new RequestController({
            ...controllerConfig,
            requestKey,
            createRequestStateStore: createMobxRequestStateStore,
        });

        this.enabled = enabled;
        this.enableOnDemand = enableOnDemand;
        this.pollInterval = pollInterval;
        this.requestKey = requestKey;

        if (!this.enableOnDemand) {
            this.subscribe();
        }
    }

    private subscribe() {
        if (this.isSubscribed) {
            return;
        }

        this.isSubscribed = true;
        this.reactionDisposers.add(
            reaction(
                () => [this.resolveEnabled(), this.requestKey()] as const,
                ([enabled]) => {
                    if (enabled) {
                        void this.autoRequest();
                    } else {
                        this.requestController.cancel();
                    }
                },
                {
                    fireImmediately: true,
                    equals: comparer.structural,
                }
            ),
            reaction(
                () => [this.resolveEnabled(), this.resolvePollInterval()] as const,
                ([enabled, pollInterval]) => {
                    this.pollIntervalDisposer.dispose();

                    if (!enabled || !pollInterval || pollInterval <= 0) {
                        return;
                    }

                    const intervalId = setInterval(() => {
                        if (this.resolveEnabled()) {
                            void this.request();
                        }
                    }, pollInterval);

                    this.pollIntervalDisposer.add(() => clearInterval(intervalId));
                },
                {
                    fireImmediately: true,
                }
            )
        );
    }

    public get state() {
        if (this.enableOnDemand) {
            this.subscribe();
        }
        return this.requestController.state;
    }

    public get dataUpdatedAt() {
        return this.state.dataUpdatedAt;
    }

    public get isSuccessful() {
        return this.state.status === "success";
    }

    public get isError() {
        return this.state.status === "error";
    }

    public get isPending() {
        return this.state.status === "pending";
    }

    public get requestStatus() {
        return this.state.requestStatus;
    }

    public get isIdle() {
        return this.state.requestStatus === "idle";
    }

    public get isPlaceholderData() {
        return this.state.isPlaceholderData;
    }

    public get isRequesting() {
        return this.state.requestStatus === "requesting";
    }

    public get error() {
        return this.state.error;
    }

    public get data() {
        return this.state.data;
    }

    public request() {
        return this.requestController.request();
    }

    private resolveEnabled() {
        return typeof this.enabled === "function" ? this.enabled() : this.enabled;
    }

    private resolvePollInterval() {
        return typeof this.pollInterval === "function" ? this.pollInterval() : this.pollInterval;
    }

    private async autoRequest() {
        try {
            await this.requestController.request();
        } catch (error) {
            if (error instanceof CancelledError) {
                return;
            }
            // todo: Добавить логику на исключение
            console.error(error);
        }
    }

    public cancel() {
        this.requestController.cancel();
    }

    public destroy() {
        this.requestController.cancel();
        this.pollIntervalDisposer.dispose();
        this.reactionDisposers.dispose();
    }
}
