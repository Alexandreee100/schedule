import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
    js.configs.recommended,
    ts.configs.recommended,
    {
        rules: {
            "no-prototype-builtins": "off",
            "no-empty": ["error", { allowEmptyCatch: true }],
            "no-debugger": "error",
            "no-duplicate-imports": "error",

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
            "@typescript-eslint/no-unused-expressions": [
                "error",
                { allowTernary: true },
            ],
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    overrides: {
                        constructors: "off",
                    },
                },
            ],
        },
    },
    prettier,
]);
