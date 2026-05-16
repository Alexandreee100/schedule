import { formatCsvQueryValue, isCsvQueryParamValue } from "./formatters/csv";
import { shouldAppendQueryValue } from "./query-value";
import type { AddQueryParamsOptions, QueryParams, QueryParamValue, QueryValue } from "./types";

export class URLBuilder {
	private segments: string[] = [];
	private queryParams = new URLSearchParams();

	constructor(private readonly baseUrl: string = "") {
		this.baseUrl = this.normalizeBaseUrl(baseUrl);
	}

	public addPathSegment(segment: string | number | undefined | null) {
		if (segment === undefined || segment === null) return this;

		const normalized = this.normalizeSegment(String(segment));
		if (normalized) {
			this.segments.push(normalized);
		}
		return this;
	}

	public addPathSegments(...segments: Array<string | number | undefined | null>) {
		segments.forEach((segment) => {
            this.addPathSegment(segment);
        });
		return this;
	}

	public addQueryParam(key: string, value: QueryParamValue, options: AddQueryParamsOptions = {}) {
		const arrayFormat = options.arrayFormat ?? "csv";

		if (isCsvQueryParamValue(value)) {
			this.appendCsvQueryValue(key, value.value, options);
			return this;
		}

		if (Array.isArray(value)) {
			if (arrayFormat === "csv") {
				this.appendCsvQueryValue(key, value, options);
				return this;
			}

			for (const item of value) {
				this.appendSingleQueryValue(key, item, options);
			}
			return this;
		}

		this.appendSingleQueryValue(key, value, options);
		return this;
	}

	public addQueryParams(params: QueryParams, options?: AddQueryParamsOptions) {
		Object.entries(params).forEach(([key, value]) => {
            this.addQueryParam(key, value, options);
        });
		return this;
	}

	public build(): string {
		return this.buildUrl(this.baseUrl, this.buildPath());
	}

	public reset() {
		this.segments = [];
		this.queryParams = new URLSearchParams();
		return this;
	}

	private appendSingleQueryValue(key: string, value: QueryValue, options?: AddQueryParamsOptions) {
		if (shouldAppendQueryValue(value, options)) {
			this.queryParams.append(key, String(value));
		}
	}

	private appendCsvQueryValue(key: string, value: QueryValue[], options?: AddQueryParamsOptions) {
		const queryValue = formatCsvQueryValue(value, options);
		if (queryValue !== undefined) {
			this.queryParams.append(key, queryValue);
		}
	}

	private buildUrl(baseUrl: string, path: string): string {
		const withPath = this.appendPath(baseUrl, path);
		return this.appendQuery(withPath, path);
	}

	private buildPath(): string {
		return this.segments.join("/");
	}

	private appendPath(baseUrl: string, path: string): string {
		if (!path) {
			return baseUrl;
		}

		if (baseUrl === "/") {
			return baseUrl + path;
		}

		return baseUrl + "/" + path;
	}

	private shouldTrimTrailingSlash(url: string, path: string): boolean {
		return url.endsWith("/") && this.baseUrl !== "/" && !path;
	}

	private appendQuery(url: string, path: string): string {
		if (this.queryParams.size === 0) {
			return url;
		}

		if (this.shouldTrimTrailingSlash(url, path)) {
			url = url.slice(0, -1);
		}

		return url + "?" + this.queryParams.toString();
	}

	private normalizeBaseUrl(baseUrl: string): string {
		if (baseUrl === "/") return "/";
		return baseUrl.replace(/\/+$/g, "");
	}

	private normalizeSegment(segment: string): string {
		return segment.replace(/^\/+|\/+$/g, "");
	}
}
