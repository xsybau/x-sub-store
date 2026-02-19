import { safeFetch } from '~/server/utils/fetcher';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if (!body.url) throw createError({ statusCode: 400, statusMessage: 'URL required' });

    const start = Date.now();
    try {
        const content = await safeFetch(body.url);
        const duration = Date.now() - start;
        return {
            success: true,
            status: 200,
            duration,
            size: content.length,
            preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        };
    } catch (e: any) {
        return {
            success: false,
            error: e.message,
            duration: Date.now() - start
        };
    }
});
