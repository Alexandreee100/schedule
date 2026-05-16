export class ApiError extends Error {
    public readonly status: number;
    public readonly response: Response;
    public readonly data: unknown;

    constructor(status: number, response: Response, data?: unknown, options?: { cause?: unknown }) {
        const message = `Запрос завершился со статусом ${status}${response.statusText}`;
        super(message, options);

        this.name = "ApiError";
        this.status = status;
        this.response = response;
        this.data = data;
    }

    static async from(response: Response, options?: { cause?: unknown }): Promise<ApiError> {
        const cloned = response.clone();
        const contentType = cloned.headers.get("content-type") ?? "";

        const data: unknown = contentType.includes("application/json")
            ? await cloned.json().catch(() => undefined)
            : undefined;

        return new ApiError(response.status, response, data, options);
    }
}
