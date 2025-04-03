import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { AvitoListing } from "./types.ts";


export function parseAvitoListings(html: string): AvitoListing[] {
    const $ = cheerio.load(html);

    const listings = $("div[itemtype*='http://schema.org/Product']").map((_, el) => {
        const id = el.attribs['data-item-id'];
        const title = $(el).find("h3").text().trim();
        const price = $(el).find("[data-marker='item-price']").text().trim();
        const link = "https://www.avito.ru" + $(el).find("a").attr("href");
        return { id, title, price, link };
    }).get();

    return listings;
}

export function parseListingCount(html: string) {
    const $ = cheerio.load(html);
    const countText = $("[data-marker='page-title/count']").text().trim();
    return countText ? parseInt(countText.replace(/\D/g, ""), 10) : 0;
}

export function minimizeHtml(html: string) {
    const $ = cheerio.load(html);
    const itemsContainer = $("div[class^='index-center']").first();

    // Извлекаем часть дерева
    return $.html(itemsContainer);
}
