import react from "@schedule/eslint-config/react";
import mobx from "eslint-plugin-mobx";

export default [
    ...react,
    {
        settings: {
            componentWrapperFunctions: ["observer"],
        },
        extends: [mobx.flatConfigs.recommended],
        rules: {
            "mobx/exhaustive-make-observable": "off",
            "mobx/missing-observer": "off",
        },
    },
];
