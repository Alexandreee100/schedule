import type { AddQueryParamsOptions, QueryValue } from "./types";

type QueryValueOptions = Pick<AddQueryParamsOptions, "includeEmptyString">;

export const shouldAppendQueryValue = (
	value: QueryValue,
	options: QueryValueOptions = {},
): value is Exclude<QueryValue, null | undefined> =>
	value !== null && value !== undefined && (options.includeEmptyString === true || value !== "");
