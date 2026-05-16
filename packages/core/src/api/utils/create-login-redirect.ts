export function createLoginRedirect(baseUrl: string): () => void {
    return () => {
        const returnUrl = window.location.href;
        window.location.replace(
            `${baseUrl}/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`,
        );
    };
}
