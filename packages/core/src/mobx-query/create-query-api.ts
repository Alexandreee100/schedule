import type {
    DefaultError,
    InfiniteData,
    QueryKey,
} from "@tanstack/query-core";
import {
    type AnyQueryClient,
    InfiniteQuery,
    type InfiniteQueryFlattenConfig,
    Mutation,
    type MutationConfig,
    Query,
    type QueryOptionsParams,
} from "mobx-tanstack-query";

export type QueryApi = ReturnType<typeof createQueryApi>;

export const createQueryApi = (queryClient: AnyQueryClient) => {
    const createQuery = <
        TQueryFnData = unknown,
        TError = DefaultError,
        TData = TQueryFnData,
        TQueryData = TQueryFnData,
        TQueryKey extends QueryKey = QueryKey,
    >(
        config: () => QueryOptionsParams<
            TQueryFnData,
            TError,
            TData,
            TQueryData,
            TQueryKey
        >,
    ) => new Query(queryClient, config);

    const createInfiniteQuery = <
        TQueryFnData = unknown,
        TError = DefaultError,
        TPageParam = unknown,
        TData = InfiniteData<TQueryFnData, TPageParam>,
        TQueryKey extends QueryKey = QueryKey,
    >(
        config: () => InfiniteQueryFlattenConfig<
            TQueryFnData,
            TError,
            TPageParam,
            TData,
            TQueryKey
        >,
    ) => new InfiniteQuery(queryClient, config);

    const createMutation = <
        TData = unknown,
        TVariables = void,
        TError = DefaultError,
        TOnMutateResult = unknown,
    >(
        config: Omit<
            MutationConfig<TData, TVariables, TError, TOnMutateResult>,
            "queryClient"
        >,
    ) => {
        return new Mutation({ ...config, queryClient });
    };

    return {
        queryClient,
        createQuery,
        createInfiniteQuery,
        createMutation,
    };
};
