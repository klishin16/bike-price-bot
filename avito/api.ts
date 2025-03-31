import db from "../database.ts";
import { AVITO_DB_LAST_FETCH_TIMESTAMP, AVITO_DB_PAGE, AVITO_PAGE } from "./constants.ts";
import { minimizeHtml } from "./parser.ts";
import { writeAvitoPage } from "./utils.ts";

export async function fetchAvitoPage(url: string) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    const rawHtml = await response.text();
    return minimizeHtml(rawHtml);
}

export async function fetchAvitoPageWithCache(url: string): Promise<string> {
    const now = new Date();
    const lastFetchTime: number = await db.getValue(AVITO_DB_LAST_FETCH_TIMESTAMP);
    if (!!lastFetchTime && now.getTime() - lastFetchTime < 5 * 60 * 1000) {
        console.log('Используем страницу из кэша')
        const html = await db.readLargeString(AVITO_DB_PAGE);
        if (!html) {
            throw new Error()
        }

        return html;
    }

    const html = await fetchAvitoPage(url);
    /** TODO Debug */
    await writeAvitoPage(AVITO_PAGE, html);
    await db.writeLargeString(AVITO_DB_PAGE, html);
    await db.setValue(AVITO_DB_LAST_FETCH_TIMESTAMP, now.getTime());

    return html;
}
