type SetStateAction<T> = T | ((prevState: T) => T);

export interface IStateStore<TState> {
    get(): TState;
    set: (state: SetStateAction<TState>) => void;
    state: TState;
}

export type ReactiveAdapter<TState extends object> = (target: IStateStore<TState>) => IStateStore<TState>;

export const createStateStore = <TState extends object>(state: TState, adapter: ReactiveAdapter<TState> = identity) => {
    const store: IStateStore<TState> = {
        state,
        get(): TState {
            return this.state;
        },
        set(action: SetStateAction<TState>): void {
            this.state = typeof action === "function" ? action(this.state) : action;
        },
    };

    return adapter(store);
};

const identity = <T>(target: T): T => target;
