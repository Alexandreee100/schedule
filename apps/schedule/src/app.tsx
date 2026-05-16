import { Theme } from "@radix-ui/themes";
import { queryApi } from "@/core/query/api";
import { QueryClientProvider } from "@/core/query/provider";
import Students from "./pages/students";

export const App = () => {
    return (
        <QueryClientProvider value={queryApi.queryClient}>
            <Theme>
                <Students />
            </Theme>
        </QueryClientProvider>
    );
};
