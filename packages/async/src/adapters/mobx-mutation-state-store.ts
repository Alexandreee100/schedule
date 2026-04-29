import { observable } from "mobx";
import { createStateStore, type IStateStore } from "../utils/create-state-store";

import type { MutationState } from "../mutation/mutation-state";

export const mobxMutationStateStoreAdapter = <TData>(state: IStateStore<MutationState<TData>>) => {
    return observable(state, undefined, { autoBind: true });
};

export const createMobxMutationStateStore = <TData>(initialState: MutationState<TData>) => {
    return createStateStore(initialState, mobxMutationStateStoreAdapter);
};
