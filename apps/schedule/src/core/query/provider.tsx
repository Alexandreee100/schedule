import { createContext } from "react";
import type { AnyQueryClient } from "@schedule/mobx-query";
import { createUseContextHook } from "@schedule/core/react";

const QueryClientContext = createContext<AnyQueryClient | undefined>(undefined);

export const useQueryClient = createUseContextHook(QueryClientContext);
export const QueryClientProvider = QueryClientContext.Provider;
