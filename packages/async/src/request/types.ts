export type RequestKey = readonly unknown[];
export type RequestFn<TRequestKey extends RequestKey, TData> = (arg: {
    requestKey: TRequestKey;
    signal?: AbortSignal;
}) => Promise<TData>;
