import { observable } from "mobx";
import { createStateStore, type IStateStore } from "../utils/create-state-store";
import type { RequestState } from "../request/request-state";
import type { RequestData } from "../request/types";

export const mobxRequestStateStoreAdapter = <TData extends RequestData>(state: IStateStore<RequestState<TData>>) => {
    return observable(state, undefined, { autoBind: true });
};

export const createMobxRequestStateStore = <TData extends RequestData>(initialState: RequestState<TData>) => {
    return createStateStore(initialState, mobxRequestStateStoreAdapter);
};
