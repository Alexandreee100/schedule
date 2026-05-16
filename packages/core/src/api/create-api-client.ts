import type { ApiClient, ApiClientConfig, ApiRequestConfig, Middleware, NextFn } from "./api-client.types.ts";
import { ApiError } from "./api-error";
import type { FetchRequestOptions, RequestBody, RequestOptions } from "./request.types.ts";

const FETCH_OPTION_KEYS = [
	"credentials",
	"mode",
	"cache",
	"redirect",
	"referrerPolicy",
	"integrity",
	"keepalive",
] as const satisfies ReadonlyArray<keyof FetchRequestOptions>;

const mergeHeaders = (defaultHeaders: HeadersInit | undefined, requestHeaders?: HeadersInit): Headers => {
	const merged = new Headers(defaultHeaders);

	if (requestHeaders) {
		new Headers(requestHeaders).forEach((value, key) => {
            merged.set(key, value);
        });
	}

	return merged;
};

const mergeFetchOptions = (
	clientDefaults: FetchRequestOptions,
	perRequest: FetchRequestOptions | undefined,
): FetchRequestOptions => {
	const merged: FetchRequestOptions = {};

	for (const key of FETCH_OPTION_KEYS) {
		const requestValue = perRequest?.[key];
		const defaultValue = clientDefaults[key];
		const value = requestValue !== undefined ? requestValue : defaultValue;
		if (value !== undefined) {
			(merged as Record<string, unknown>)[key] = value;
		}
	}

	return merged;
};

const prepareRequestBody = (body: unknown, headers: Headers): BodyInit | undefined => {
	if (body === undefined || body === null) return undefined;

	if (body instanceof FormData) {
		headers.delete("Content-Type");
		return body;
	}

	if (body instanceof Blob || body instanceof URLSearchParams || typeof body === "string") {
		return body;
	}

	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	return JSON.stringify(body);
};

const buildMiddlewarePipeline = (middleware: readonly Middleware[], baseFn: NextFn): NextFn =>
	middleware.reduceRight<NextFn>((next, mw) => (config) => mw(config, next), baseFn);

export const createApiClient = (config: ApiClientConfig): ApiClient => {
	const { baseURL, headers: defaultHeaders, middleware = [], ...defaultFetchOptions } = config;

	const baseFetch: NextFn = (cfg) =>
		fetch(cfg.url, {
			method: cfg.method,
			headers: cfg.headers,
			body: cfg.body,
			signal: cfg.signal,
			credentials: cfg.credentials,
			mode: cfg.mode,
			cache: cfg.cache,
			redirect: cfg.redirect,
			referrerPolicy: cfg.referrerPolicy,
			integrity: cfg.integrity,
			keepalive: cfg.keepalive,
		});

	const pipeline = buildMiddlewarePipeline(middleware, baseFetch);

	const resolveUrl = (path: string): string =>
		baseURL ? new URL(path, baseURL).toString() : new URL(path).toString();

	const request = async <TRaw, TOutput = TRaw>(
		method: string,
		path: string,
		body?: RequestBody,
		options?: RequestOptions<TRaw, TOutput>,
	) => {
		const url = resolveUrl(path);
		const headers = mergeHeaders(defaultHeaders, options?.headers);
		const resolvedBody = prepareRequestBody(body, headers);
		const fetchOptions = mergeFetchOptions(defaultFetchOptions, options);

		const reqConfig: ApiRequestConfig = {
			url,
			method,
			headers,
			body: resolvedBody,
			signal: options?.signal,
			...fetchOptions,
		};

		const response = await pipeline(reqConfig);

		if (options?.as === "raw") return response;

		const expectNoContent = options?.expectNoContent === true;

		if (response.status === 204) {
			if (expectNoContent) return undefined;

			throw new Error(
				"Ожидалось тело ответа в формате JSON, но получен статус 204 No Content. Используйте expectNoContent: true.",
			);
		}

		if (!response.ok) {
			throw await ApiError.from(response);
		}

		const raw: TRaw = await response.json();

		const transform = options?.transformResponse;

		if (transform) {
			return transform(raw);
		}

		return raw;
	};

	return {
		request: <TRaw, TOutput = TRaw>(
			method: string,
			path: string,
			body?: RequestBody,
			options?: RequestOptions<TRaw, TOutput>,
		) => request<TRaw, TOutput>(method, path, body, options),
		get: <TRaw, TOutput = TRaw>(path: string, options?: RequestOptions<TRaw, TOutput>) =>
			request<TRaw, TOutput>("GET", path, undefined, options),
		post: <TRaw, TOutput = TRaw>(path: string, body?: RequestBody, options?: RequestOptions<TRaw, TOutput>) =>
			request<TRaw, TOutput>("POST", path, body, options),
		put: <TRaw, TOutput = TRaw>(path: string, body?: RequestBody, options?: RequestOptions<TRaw, TOutput>) =>
			request<TRaw, TOutput>("PUT", path, body, options),
		patch: <TRaw, TOutput = TRaw>(path: string, body?: RequestBody, options?: RequestOptions<TRaw, TOutput>) =>
			request<TRaw, TOutput>("PATCH", path, body, options),
		delete: <TRaw, TOutput = TRaw>(path: string, body?: RequestBody, options?: RequestOptions<TRaw, TOutput>) =>
			request<TRaw, TOutput>("DELETE", path, body, options),
	};
};
