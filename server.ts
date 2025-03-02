import { Telegraf } from "npm:telegraf";
import {
  BikeKey,
  BIKES,
  DebugButtons,
  DebugButtonsKey,
  ExtraButtons,
  ExtraButtonsKey,
  PRICE_KEY,
} from "./constants.ts";
import db from "./database.ts";
import { BikeInfo } from "./types.ts";
import config from "./config.ts";
import { getDebugKeyboard, getKeyboard } from "./keyboards.ts";

/** HTTP server */
Deno.serve({ port: 3000 }, async (_req) => {
  await updatePrice();

  return new Response("ok");
});

const bot = new Telegraf(config.TOKEN);

const getInfo = async (
  url: string,
): Promise<BikeInfo> => {
  console.log(`Getting info for ${url}`);
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
};

const updatePrice = async () => {
  const requestsPromises: Promise<{
    bike: string;
    bikeInfo: BikeInfo;
  }>[] = [];

  Object.entries(BIKES).map(([bike, data]) => {
    requestsPromises.push(new Promise((resolve) => {
      getInfo(data.dataUrl).then(bikeInfo => {
        resolve({
          bike,
          bikeInfo,
        })
      });
    }));

  });

  const responses = await Promise.all(requestsPromises);

  for (const { bike, bikeInfo } of responses) {
    const prevPrice = await db.getCurrentPrice(bike);
    const currentPrice = bikeInfo.price;

    if (!prevPrice) {
      await db.setCurrentPrice(bike, currentPrice);
      return;
    }

    if (currentPrice !== prevPrice) {
      await db.setCurrentPrice(bike, currentPrice);
      await notifySubscribers(bike, currentPrice);
    }
  }
};

const notifySubscribers = async (bike: BikeKey, price: number) => {
  const entries = db.getSubscribedUsers();
  for await (const entry of entries) {
    await bot.telegram.sendMessage(
      entry.key[1].toString(),
      `У ${bike}\nНовая цена: ${price}`,
    );
  }
};

/** Bikes кнопки */
const prepareBikesButtonsHears = () => {
  Object.entries(BIKES).forEach(([bike, data]) => {
    bot.hears(bike, async (ctx) => {
      const info = await getInfo(data.dataUrl);
      if (!info) {
        return ctx.reply("Ошибка API");
      }
      ctx.replyWithPhoto(
          data.imageUrl,
          {
            caption: `${info.model}\nЦена: ${info.price} рублей`,
            ...(await getKeyboard(ctx.chat.id)),
          },
      );
    });
  });
}


/** Дополнительные кнопки */
const prepareExtraButtonsHears = () => {
  Object.keys(ExtraButtons).forEach((button) => {
    bot.hears(button, async (ctx) => {
      switch (button as ExtraButtonsKey) {
        case "Подписаться на изменения цены":
          await db.setSubscribed(ctx.chat.id);
          ctx.reply(
              "Вы подписались на уведомления об изменения цены",
              await getKeyboard(ctx.chat.id),
          );
          break;
        case "Прекратить подписку":
          await db.deleteSubscription(ctx.chat.id);
          ctx.reply("Подписка отменена", await getKeyboard(ctx.chat.id));
          break;
        case "Debug":
          ctx.reply("Enter debug mode", getDebugKeyboard());
          break;
        default:
          ctx.reply("Нет!❌❌❌");
      }
    });
  });
}

/** Debug кнопки */
const prepareDebugButtons = () => {
  Object.keys(DebugButtons).forEach((button) => {
    bot.hears(button, async (ctx) => {
      switch (button as DebugButtonsKey) {
        case "Список подписчиков": {
          let msg = "";
          const entries = db.getSubscribedUsers();
          for await (const entry of entries) {
            msg += entry.key[1].toString() + "\n";
          }
          ctx.reply(msg || "Подписчиков нет");

          break;
        }
        case "Тест уведомления": {
          const entries = db.getSubscribedUsers();
          for await (const entry of entries) {
            await bot.telegram.sendMessage(
                entry.key[1].toString(),
                "Тестовое сообщение уведомления",
            );
          }

          break;
        }
        case "Exit debug":
          ctx.reply("Enter normal mode", await getKeyboard(ctx.chat.id));
          break;
        default:
          ctx.reply("🥺");
      }
    });
  });
}

// bootstrap
(() => {
  try {
    bot.start(async (ctx) => {
      ctx.replyWithHTML(
        "Добро пожаловать в <b>bike-price-bot</b>\n\n" +
          "Для получения цены используйте кнопки <b>ниже</b>",
        await getKeyboard(ctx.chat.id),
      );
    });

    prepareBikesButtonsHears();
    prepareExtraButtonsHears();
    prepareDebugButtons();

    bot.launch().then(() => console.log("Bot launched successfully"));
  } catch (error) {
    console.error("Error initializing bot:", error);
  }
})();
