/**
 * @type {import("lint-staged").Configuration}
 */
const config = {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{html,css,less,ejs}": ["prettier --write"],
};

export default config;
