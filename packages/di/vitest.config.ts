import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    oxc: false,
    test: {},
    plugins: [
        swc.vite({
            jsc: {
                parser: {
                    syntax: "typescript",
                    decorators: true,
                },
            },
        }),
    ],
});
