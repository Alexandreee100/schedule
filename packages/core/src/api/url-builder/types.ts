export type QueryValue = string | number | boolean | null | undefined;

export type CsvQueryParamValue = {
	format: "csv";
	value: QueryValue[];
};

export type QueryParamValue = QueryValue | QueryValue[] | CsvQueryParamValue;

export type QueryParams = Record<string, QueryParamValue>;

export type QueryArrayFormat = "repeat" | "csv";

export type AddQueryParamsOptions = {
	arrayFormat?: QueryArrayFormat;
	includeEmptyString?: boolean;
};
