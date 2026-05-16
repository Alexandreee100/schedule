import "vitest/config";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import babel from "vite-plugin-babel";
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
					["@babel/plugin-proposal-decorators", { version: "legacy" }],
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
