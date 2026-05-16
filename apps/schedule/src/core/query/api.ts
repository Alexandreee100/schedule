import { createQueryApi, QueryClient } from "@schedule/core/mobx-query";

const queryClient = new QueryClient();
export const queryApi = createQueryApi(queryClient);
