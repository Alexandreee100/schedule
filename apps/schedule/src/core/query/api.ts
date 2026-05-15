import { createQueryApi, QueryClient } from "@schedule/mobx-query";

const queryClient = new QueryClient();
export const queryApi = createQueryApi(queryClient);
