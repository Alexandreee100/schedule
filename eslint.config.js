import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import react from "eslint-plugin-react";
import ts from "typescript-eslint";
import mobx from "eslint-plugin-mobx";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
    {
        settings: {
            react: {
                version: "detect",
            },
            componentWrapperFunctions: ["observer"],
        },
        extends: [
            js.configs.recommended,
            ts.configs.recommended,
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],

            mobx.flatConfigs.recommended,
            prettier,
        ],
        plugins: {
            "react": react,
            "react-hooks": reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "no-prototype-builtins": "off",
            "no-empty": ["error", { allowEmptyCatch: true }],
            "no-debugger": "error",
            "no-duplicate-imports": "error",

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

            "@typescript-eslint/await-thenable": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    args: "none",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
            "@typescript-eslint/method-signature-style": ["error", "property"],
            "@typescript-eslint/no-unused-expressions": ["error", { allowTernary: true }],
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    overrides: {
                        constructors: "off",
                    },
                },
            ],

            "mobx/exhaustive-make-observable": "off",
            "mobx/missing-observer": "off",
        },
    },
]);
