export interface ProxyUrlConfig {
    isEnabled: () => boolean;
    baseUrl: string;
}

export function createProxyUrl(config: ProxyUrlConfig): (url: string) => string {
    return (url) => {
        if (config.isEnabled() && !url.includes(config.baseUrl)) {
            return `${config.baseUrl}?proxy=${url}`;
        }
        return url;
    };
}
