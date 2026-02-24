/// <reference types="vitest/config" />

import babel from "vite-plugin-babel";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import checker from "vite-plugin-checker";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
    const envs = loadEnv(mode, process.cwd(), "");

    const isDevMode = mode === "development";

    const plugins: PluginOption[] = [
        babel({
            babelConfig: {
                assumptions: {
                    setPublicClassFields: true,
                },
                presets: [
                    /**
                     * Парсим тайпскрипт через babel, чтобы иметь возможность использовать декораторы в абстрактных
                     * классах https://github.com/babel/babel/pull/7850
                     */
                    [
                        "@babel/preset-typescript",
                        {
                            isTSX: true,
                            onlyRemoveTypeImports: true,
                            optimizeConstEnums: true,
                            allExtensions: true,
                        },
                    ],
                ],
                plugins: [
                    [
                        "@babel/plugin-proposal-decorators",
                        { version: "legacy" },
                    ],
                    "@babel/plugin-transform-class-properties",
                    "@babel/plugin-transform-class-static-block",
                ],
            },
        }),
        react(),
        svgr({
            svgrOptions: {
                ref: true,
            },
        }),
        tsconfigPaths(),
    ];

    if (isDevMode) {
        plugins.push(
            checker({
                overlay: {
                    initialIsOpen: "error",
                },
                typescript: true,
                eslint: {
                    lintCommand: "eslint",
                    useFlatConfig: true,
                },
            })
        );
    }

    return {
        appType: "spa",
        plugins,
        base: envs.PUBLIC_URL,
        build: {
            sourcemap: "hidden",
            target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
            outDir: "./build",
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            return "vendor";
                        }
                    },
                },
            },
        },
        test: {
            environment: "happy-dom",
        },
        server: {
            host: true,
        },
    };
});
