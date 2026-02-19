import { ofetch } from 'ofetch';

const isSafeUrl = (url: string) => {
    try {
        const u = new URL(url);
        if (!['http:', 'https:'].includes(u.protocol)) return false;
        const hostname = u.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
};

export const safeFetch = async (url: string) => {
    if (!isSafeUrl(url)) {
        throw new Error(`Unsafe URL: ${url}`);
    }

    const config = useRuntimeConfig();
    const timeout = config.fetchTimeoutMs || 10000;
    const commonHeaders = {
        Accept: 'text/plain,*/*;q=0.9'
    };

    // Some providers return an HTML landing page for specific user agents.
    // Fetch with a neutral request first, then retry once with curl UA if HTML is returned.
    const first = await ofetch(url, {
        timeout,
        responseType: 'text',
        headers: commonHeaders
    });

    if (/<(?:!doctype\s+html|html|head|body)\b/i.test(first)) {
        const retry = await ofetch(url, {
            timeout,
            responseType: 'text',
            headers: {
                ...commonHeaders,
                'User-Agent': 'curl/8.0.1'
            }
        });

        if (!/<(?:!doctype\s+html|html|head|body)\b/i.test(retry)) {
            return retry;
        }
    }

    return first;
};
