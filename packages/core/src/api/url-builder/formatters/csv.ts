import type { AddQueryParamsOptions, CsvQueryParamValue, QueryParamValue, QueryValue } from "../types";
import { shouldAppendQueryValue } from "../query-value";

/** Форматирует массив как один query-параметр со значениями через запятую. */
export const csv = (value?: QueryValue[]): CsvQueryParamValue | undefined => {
    if (value === undefined) {
        return undefined;
    }

    return {
        format: "csv",
        value,
    };
};

export const isCsvQueryParamValue = (value: QueryParamValue): value is CsvQueryParamValue =>
    typeof value === "object" && value !== null && !Array.isArray(value) && value.format === "csv";

export const formatCsvQueryValue = (value: QueryValue[], options?: AddQueryParamsOptions): string | undefined => {
    const queryValues = value.filter((item) => shouldAppendQueryValue(item, options));
    return queryValues.length ? queryValues.join(",") : undefined;
};
