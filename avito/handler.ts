import {
  AVITO_DB_COUNT_KEY,
  AVITO_DB_LISTINGS,
  AVITO_SPECIALIZEDES_URL,
  fetchAvitoPage,
  parseAvitoListings,
  parseListingCount,
} from "./index.ts";
import db from "../database.ts";
import { AvitoListing } from "./types.ts";
import { BotHandler } from "../types.ts";
import { Bot } from "../bot.ts";
import { Logger } from "../common/logger.ts";

export class AvitoHandler extends BotHandler {
  private logger = new Logger("AvitoHandler");

  public async handle(bot: Bot) {
    try {
      const html = await fetchAvitoPage(AVITO_SPECIALIZEDES_URL);
      const listingCount = parseListingCount(html);
      const listings = parseAvitoListings(html);

      const raw: string = await db.getValue(AVITO_DB_LISTINGS);
      const prevListings: AvitoListing[] = JSON.parse(raw) || [];
      const prevListingsMap = new Map(
          prevListings.map((listing) => [listing.id, listing]),
      );
      const newListings: AvitoListing[] = [];
      listings.forEach((listing) => {
        if (!prevListingsMap.has(listing.id)) {
          newListings.push(listing);
        }
      });
      this.logger.info(`Prev listnings: ${prevListings.length}, new listings: ${newListings.length}`);
      if (newListings.length) {
        await bot.notifySubscribers(`
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
        await bot.notifySubscribers(
            `Изменилось количество объявлений на Avito: ${listingCount}`,
        );
      }

      return listingCount;
    } catch (error) {
      console.error("Avito module error:", error);
    }
  };
}


