export type RequestBody = BodyInit | Record<string, unknown> | unknown[];

export interface FetchRequestOptions {
	credentials?: RequestCredentials;
	mode?: RequestMode;
	cache?: RequestCache;
	redirect?: RequestRedirect;
	referrerPolicy?: ReferrerPolicy;
	integrity?: string;
	keepalive?: boolean;
}

export interface BaseRequestOptions extends FetchRequestOptions {
	headers?: HeadersInit;
	signal?: AbortSignal;
}

export interface JsonRequestOptions<TRaw = unknown, TOutput = TRaw> extends BaseRequestOptions {
	as?: "json";
	expectNoContent?: false;
	transformResponse?: (input: TRaw) => TOutput;
}

export interface VoidRequestOptions<TRaw = unknown, TOutput = TRaw> extends BaseRequestOptions {
	as?: "json";
	expectNoContent: true;
	transformResponse?: (input: TRaw) => TOutput;
}

export interface RawRequestOptions extends BaseRequestOptions {
	as: "raw";
}

export type RequestOptions<TRaw = unknown, TOutput = TRaw> =
	| JsonRequestOptions<TRaw, TOutput>
	| VoidRequestOptions<TRaw, TOutput>
	| RawRequestOptions;
