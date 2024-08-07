export function normalizePath(str: string) {
    return '/' + str.replace(/^\/+/gi, '');
}

export function normalizeServerUrl(str: string) {
    return str.replace(/\/+$/, '');
}
