/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    printWidth: 120,
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
                bracketSameLine: true,
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
    plugins: ["prettier-plugin-sh"],
};

export default config;
