import type { AnyQueryClient } from "@schedule/core/mobx-query";
import { createUseContextHook } from "@schedule/core/react";
import { createContext } from "react";

const QueryClientContext = createContext<AnyQueryClient | undefined>(undefined);

export const useQueryClient = createUseContextHook(QueryClientContext);
export const QueryClientProvider = QueryClientContext.Provider;
