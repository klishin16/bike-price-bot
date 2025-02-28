import { Telegraf, Markup } from "npm:telegraf";
import { BIKES } from "./constants.ts";

const TOKEN = Deno.env.get("BOT_TOKEN");
if (!TOKEN) {
  throw new Error("Bot token doesn't exist");
}

const PRICE_KEY = "precio_win_164";

Deno.serve({ port: 3000 }, (_req) => {
  return new Response("Ok");
});

const bot = new Telegraf(TOKEN);

const getInfo = async (url: string) => {
  console.log(`Getting info for ${url}`);
  try {
    const response = await fetch(
      new Request(url, {
        headers: {
          "Host": "dc.tradeinn.com",
          "Referer":
            "https://www.tradeinn.com/bikeinn/ru/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-expert-29-27.5-gx-eagle-2023/140247111/p",
        },
      }),
    );

    const data = await response.json();

    return {
      model: data._source.model.eng,
      price: data._source[PRICE_KEY],
    };
  } catch (error) {
    console.error("Error fetching price:", error);
  }
};

// bootstrap
(async () => {
  try {
    bot.start((ctx) => {
      ctx.replyWithHTML(
        "Добро пожаловать в <b>bike-price-bot</b>\n\n" +
          "Для получения цены используйте кнопки <b>ниже</b>",
        Markup.keyboard([
          Object.keys(BIKES),
        ]).resize(),
      );
    });

    Object.entries(BIKES).forEach(([bike, apiUrl]) => {
      bot.hears(bike, async (ctx) => {
        const info = await getInfo(apiUrl);
        if (!info) {
          return ctx.reply('Ошибка API')
        }
        ctx.reply(`${info.model}\n${info.price} рублей`);
      });
    });

    bot.launch().then(() => console.log("Bot launched successfully"));
  } catch (error) {
    console.error("Error initializing bot:", error);
  }
})();
