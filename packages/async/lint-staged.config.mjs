const config = {
    "*.{js,jsx,ts,tsx}": [
        "prettier --write",
        "eslint --fix",
    ],
    "*.{html,css,less,ejs}": ["prettier --write"],
};

export default config;
