import { Markup, Telegraf } from "npm:telegraf";
import {
  BIKES,
  DebugButtons,
  DebugButtonsKeys,
  ExtraButtons,
  ExtraButtonsKeys,
  PRICE_KEY,
} from "./constants.ts";
import { splitIntoPairs } from "./utils.ts";

const TOKEN = Deno.env.get("BOT_TOKEN");
if (!TOKEN) {
  throw new Error("Bot token doesn't exist");
}

/** DB */
const kv = await Deno.openKv();

/** HTTP server */
Deno.serve({ port: 3000 }, async (_req) => {
  await notifySubscribers();

  return new Response("ok");
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

const getKeyboard = async (chatId: number) => {
  const isSubscribed = await kv.get(["price", chatId])
    .then((res) => !!res.value);

  const extraButtons = Object.entries(ExtraButtons).reduce<string[]>(
    (buttons, [button, fn]) => {
      if (fn(isSubscribed)) {
        buttons.push(button);
      }

      return buttons;
    },
    [],
  );

  return Markup.keyboard(
    [...splitIntoPairs(Object.keys(BIKES)), extraButtons],
  ).resize();
};

const getDebugKeyboard = () => {
  return Markup.keyboard(
    splitIntoPairs(Object.keys(DebugButtons)),
  ).resize();
};

const notifySubscribers = async () => {
  const entries = kv.list({ prefix: ["price"] });
  for await (const entry of entries) {
    await bot.telegram.sendMessage(
      entry.key[1].toString(),
      "Цена возможно изменилась",
    );
  }
};

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

    /** Дополнительные кнопки */
    Object.keys(ExtraButtons).forEach((button) => {
      bot.hears(button, async (ctx) => {
        switch (button as ExtraButtonsKeys) {
          case "Подписаться на изменения цены":
            await kv.set(["price", ctx.chat.id], 1);
            ctx.reply(
              "Вы подписались на уведомления об изменения цены",
              await getKeyboard(ctx.chat.id),
            );
            break;
          case "Прекратить подписку":
            await kv.delete(["price", ctx.chat.id]);
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

    /** Debug кнопки */
    Object.entries(DebugButtons).forEach(([button, data]) => {
      bot.hears(button, async (ctx) => {
        switch (button as DebugButtonsKeys) {
          case "Список подписчиков": {
            let msg = "";
            const entries = kv.list({ prefix: ["price"] });
            for await (const entry of entries) {
              msg += entry.key[1].toString() + "\n";
            }
            ctx.reply(msg || "Подписчиков нет");

            break;
          }
          case "Тест уведомления": {
            const entries = kv.list({ prefix: ["price"] });
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

    bot.launch().then(() => console.log("Bot launched successfully"));
  } catch (error) {
    console.error("Error initializing bot:", error);
  }
})();
