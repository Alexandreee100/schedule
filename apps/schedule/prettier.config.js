/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    printWidth: 80,
    tabWidth: 4,
    quoteProps: "consistent",
    endOfLine: "lf",
    overrides: [
        {
            files: "*.{js,jsx,ts,tsx}",
            options: {
                arrowParens: "always",
                semi: true,
                trailingComma: "es5",
                singleQuote: false,
                bracketSameLine: false,
            },
        },
        {
            files: ["*.json", "*.yml", "*.md"],
            options: {
                tabWidth: 2,
                printWidth: 80,
            },
        },
    ],
};

export default config;
