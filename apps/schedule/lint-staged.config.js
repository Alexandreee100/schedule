/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{html,css,less,ejs}": ["prettier --write"],
};
