import baseConfig from "./base.js";
import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
    ...baseConfig,
    {
        settings: {
            react: {
                version: "detect",
            },
        },
        extends: [
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],
            reactHooks.configs.flat.recommended,
        ],
        plugins: {
            react,
            "react-hooks": reactHooks,
        },
        rules: {
            "react/jsx-curly-brace-presence": [
                "error",
                {
                    props: "never",
                    children: "never",
                    propElementValues: "always",
                },
            ],
            "react/jsx-fragments": ["warn", "element"],
            "react/display-name": "warn",
            "react/prop-types": "off",

            "react-hooks/refs": "warn",
        },
    },
]);
