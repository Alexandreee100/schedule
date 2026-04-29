import { observable } from "mobx";
import { createStateStore, type IStateStore } from "../utils/create-state-store";
import type { RequestState } from "../request/request-state";

export const mobxRequestStateStoreAdapter = <TData>(state: IStateStore<RequestState<TData>>) => {
    return observable(state, undefined, { autoBind: true });
};

export const createMobxRequestStateStore = <TData>(initialState: RequestState<TData>) => {
    return createStateStore(initialState, mobxRequestStateStoreAdapter);
};
