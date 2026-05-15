import base from "@schedule/eslint-config/base";

export default [
    ...base,
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
