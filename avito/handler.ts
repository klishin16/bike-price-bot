import {
  AVITO_DB_COUNT_KEY, AVITO_DB_LISTINGS,
  AVITO_SPECIALIZEDES_URL,
  fetchAvitoPage,
  parseAvitoListings,
  parseListingCount,
} from "./index.ts";
import db from "../database.ts";
import { notifySubscribers } from "../server.ts";
import { AvitoListing } from "./types.ts";

export const handleAvito = async () => {
  try {
    const html = await fetchAvitoPage(AVITO_SPECIALIZEDES_URL);
    const listingCount = parseListingCount(html);
    const listings = parseAvitoListings(html);

    const raw: string = await db.getValue(AVITO_DB_LISTINGS);
    const prevListings: AvitoListing[] = JSON.parse(raw) || [];
    console.log("Prev listnings", prevListings.length);
    const prevListingsMap = new Map(
      prevListings.map((listing) => [listing.id, listing]),
    );
    const newListings: AvitoListing[] = [];
    listings.forEach((listing) => {
      if (!prevListingsMap.has(listing.id)) {
        newListings.push(listing);
      }
    });
    console.log("NewListings", newListings.length);
    if (newListings.length) {
      notifySubscribers(`
             Новые объявления: \n
             ${
        newListings.map((listing) => `${listing.title}\n ${listing.link}`).join(
          "\n",
        )
      }
            `);
    }
    await db.setValue(AVITO_DB_LISTINGS, JSON.stringify(listings));

    const prevListingCount = await db.getValue(AVITO_DB_COUNT_KEY);
    if (!prevListingCount) {
      await db.setValue(AVITO_DB_COUNT_KEY, listingCount);
      return listingCount;
    }

    if (prevListingCount !== listingCount) {
      await db.setValue(AVITO_DB_COUNT_KEY, listingCount);
      await notifySubscribers(
        `Изменилось количество объявлений на Avito: ${listingCount}`,
      );
    }

    return listingCount;
  } catch (error) {
    console.error("Avito module error:", error);
  }
};
