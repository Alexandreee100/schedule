export interface SocketAuthProvider {
    getCookie(forceRefresh?: boolean): Promise<string | null>;
    buildCookieHeader(cookie: string): Record<string, string>;
}

interface SocketAuthProviderDeps {
    getAuthCookie: () => Promise<string | null>;
}

export function createSocketAuthProvider(
    deps: SocketAuthProviderDeps,
): SocketAuthProvider {
    let cachedCookieValue: string | null = null;
    let cookieRequestPromise: Promise<string | null> | null = null;

    return {
        async getCookie(forceRefresh = false) {
            if (!forceRefresh && cachedCookieValue) {
                return cachedCookieValue;
            }

            if (!cookieRequestPromise) {
                cookieRequestPromise = deps
                    .getAuthCookie()
                    .then((value) => {
                        cachedCookieValue = value;
                        return value;
                    })
                    .catch((error) => {
                        console.error(
                            "[SocketAuthProvider] Ошибка запроса cookie",
                            error,
                        );
                        return null;
                    })
                    .finally(() => {
                        cookieRequestPromise = null;
                    });
            }

            return cookieRequestPromise;
        },

        buildCookieHeader(cookie: string) {
            return { Cookie: cookie };
        },
    };
}
