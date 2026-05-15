import { Theme } from "@radix-ui/themes";
import Students from "./pages/students";
import { QueryClientProvider } from "@/core/query/provider";
import { queryApi } from "@/core/query/api";

export const App = () => {
    return (
        <QueryClientProvider value={queryApi.queryClient}>
            <Theme>
                <Students />
            </Theme>
        </QueryClientProvider>
    );
};
