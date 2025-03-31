import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";


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


export function parseAvitoListings(html: string) {
    const $ = cheerio.load(html);

    const listings = $("div[itemtype*='http://schema.org/Product']").map((_, el) => {
        const title = $(el).find("h3").text().trim();
        const price = $(el).find(".price-text-_YGDY").text().trim();
        const link = "https://www.avito.ru" + $(el).find("a").attr("href");
        return { title, price, link };
    }).get();

    return listings;
}

export function parseListingCount(html: string) {
    const $ = cheerio.load(html);
    const countText = $("[data-marker='page-title/count']").text().trim();
    return countText ? parseInt(countText.replace(/\D/g, ""), 10) : 0;
}

// (async () => {
//     try {
//         const listings = await fetchAvitoListings(AVITO_URL);
//         console.log(listings);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// })();
