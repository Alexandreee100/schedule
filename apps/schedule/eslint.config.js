import { defineConfig } from "eslint/config";
import mobx from "eslint-plugin-mobx";
import react from "@schedule/eslint-config/react";

export default defineConfig([
    react,
    {
        settings: {
            "componentWrapperFunctions": ["observer"],
            "react-hooks": {
                additionalEffectHooks: "(useViewModel)",
            },
        },
        extends: [mobx.flatConfigs.recommended],
        rules: {
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

            "react-hooks/refs": "warn",

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
