import type {
    FetchRequestOptions,
    JsonRequestOptions,
    RawRequestOptions,
    RequestBody,
    VoidRequestOptions,
} from "./request.types.ts";

export interface ApiRequestConfig extends FetchRequestOptions {
    url: string;
    method: string;
    headers: Headers;
    body?: BodyInit | null;
    signal?: AbortSignal | null;
}

export type NextFn = (config: ApiRequestConfig) => Promise<Response>;
export type Middleware = (config: ApiRequestConfig, next: NextFn) => Promise<Response>;

export interface ApiClientConfig extends FetchRequestOptions {
    baseURL?: string;
    headers?: HeadersInit;
    middleware?: Middleware[];
}

type ReadMethod = {
    <TRaw = unknown, TResult = TRaw>(path: string, options?: JsonRequestOptions<TRaw, TResult>): Promise<TResult>;

    <TRaw = unknown, TResult = TRaw>(
        path: string,
        options: VoidRequestOptions<TRaw, TResult>
    ): Promise<TResult | undefined>;

    (path: string, options: RawRequestOptions): Promise<Response>;
};
type BodyMethod = {
    <TRaw = unknown, TResult = TRaw>(
        path: string,
        body?: RequestBody,
        options?: JsonRequestOptions<TRaw, TResult>
    ): Promise<TResult>;

    <TRaw = unknown, TResult = TRaw>(
        path: string,
        body: RequestBody | undefined,
        options: VoidRequestOptions<TRaw, TResult>
    ): Promise<TResult | undefined>;

    (path: string, body: RequestBody | undefined, options: RawRequestOptions): Promise<Response>;
};
type RequestMethod = {
    <TRaw = unknown, TResult = TRaw>(
        method: string,
        path: string,
        body?: RequestBody,
        options?: JsonRequestOptions<TRaw, TResult>
    ): Promise<TResult>;

    <TRaw = unknown, TResult = TRaw>(
        method: string,
        path: string,
        body: RequestBody | undefined,
        options: VoidRequestOptions<TRaw, TResult>
    ): Promise<TResult | undefined>;

    (method: string, path: string, body: RequestBody | undefined, options: RawRequestOptions): Promise<Response>;
};

export interface ApiClient {
    request: RequestMethod;
    get: ReadMethod;
    post: BodyMethod;
    put: BodyMethod;
    patch: BodyMethod;
    delete: BodyMethod;
}

export interface AuthMiddlewareConfig {
    getLoginUrl: () => string | undefined;
    unauthorizedCodes?: number[];
}
