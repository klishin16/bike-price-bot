import { AVITO_DB_COUNT_KEY, AVITO_SPECIALIZEDES_URL, fetchAvitoPageWithCache, parseListingCount } from "./index.ts";
import db from "../database.ts";
import { notifySubscribers } from "../server.ts";

export const handleAvito = async () => {
    try {
        const html = await fetchAvitoPageWithCache(AVITO_SPECIALIZEDES_URL);
        const listingCount = parseListingCount(html);

        const prevListingCount = await db.getValue(AVITO_DB_COUNT_KEY);
        if (!prevListingCount) {
            await db.setValue(AVITO_DB_COUNT_KEY, listingCount);
            return listingCount;
        }

        if (prevListingCount !== listingCount) {
            await db.setValue(AVITO_DB_COUNT_KEY, listingCount);
            await notifySubscribers(`Изменилось количество объявлений на Avito: ${listingCount}`);
        }

        return listingCount;
    } catch (error) {
        console.error("Avito module error:", error);
    }
}
