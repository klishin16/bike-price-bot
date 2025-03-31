import db from "../database.ts";
import { AVITO_DB_LAST_FETCH_TIMESTAMP, AVITO_PAGE } from "./constants.ts";
import { readAvitoPage, writeAvitoPage } from "./utils.ts";

export async function fetchAvitoPage(url: string) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    return await response.text();
}

export async function fetchAvitoPageWithCache(url: string) {
    const now = new Date();
    const lastFetchTime = await db.getNumber(AVITO_DB_LAST_FETCH_TIMESTAMP);
    if (!!lastFetchTime && now.getTime() - lastFetchTime < 5 * 60 * 1000) {
        console.log('Используем страницу из кэша')
        return readAvitoPage(AVITO_PAGE);
    }

    const html = await fetchAvitoPage(url);
    await writeAvitoPage(AVITO_PAGE, html);
    await db.setNumber(AVITO_DB_LAST_FETCH_TIMESTAMP, now.getTime());

    return html;
}
