import {
  AVITO_DB_LISTINGS,
  AVITO_DB_LISTINGS_COUNT,
  AVITO_SPECIALIZEDES_URL,
  fetchAvitoPage,
  parseAvito,
} from "./index.ts";
import db from "../database.ts";
import { AvitoListing } from "./types.ts";
import { BotHandler } from "../types.ts";
import { Bot } from "../bot.ts";
import { Logger } from "../common/logger.ts";

export class AvitoHandler extends BotHandler {
  private logger = new Logger("AvitoHandler");

  public async handle(bot: Bot) {
    this.logger.info('handle')

    try {
      const html = await fetchAvitoPage(AVITO_SPECIALIZEDES_URL);
      const { listings, count } = parseAvito(html);

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
      this.logger.info(
        `Prev listnings: ${prevListings.length}, new listings: ${newListings.length}`,
      );
      if (newListings.length) {
        if (newListings.length > 3) {
          await bot.notifySubscribers(`${newListings.length} новых объявлений`);
        } else {
          await bot.notifySubscribers(
            `Новые объявления: \n${
              newListings.map((listing) => `${listing.title}\n ${listing.link}`)
                .join("\n")
            }`,
          );
        }
      }
      await db.setValue(AVITO_DB_LISTINGS, JSON.stringify(listings));
      await db.setValue(AVITO_DB_LISTINGS_COUNT, count);
    } catch (error) {
      console.error("Avito module error:", error);
    }
  }

  public getListingsCount() {
    return db.getValue(AVITO_DB_LISTINGS_COUNT);
  }
}

export const avitoHanlder = new AvitoHandler()
