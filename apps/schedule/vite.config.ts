import "vitest/config";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import checker from "vite-plugin-checker";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
    const envs = loadEnv(mode, process.cwd(), "");

    const isDevMode = mode === "development";

    const plugins: PluginOption[] = [
        react(),
        svgr({
            svgrOptions: {
                ref: true,
            },
        }),
        tsconfigPaths({
            projects: ["tsconfig.app.json"],
        }),
    ];

    if (isDevMode) {
        plugins.push(
            checker({
                overlay: {
                    initialIsOpen: "error",
                },
                typescript: true,
            }),
        );
    }

    return {
        appType: "spa",
        plugins,
        base: envs.PUBLIC_URL,
        css: { modules: { localsConvention: "camelCaseOnly" } },
        build: {
            outDir: "./dist",
        },
        test: {
            environment: "happy-dom",
        },
        server: {
            host: true,
        },
    };
});
