import { Telegraf } from "npm:telegraf";
import { BIKES, DebugButtons, DebugButtonsKey, ExtraButtons, ExtraButtonsKey, } from "./constants.ts";
import db from "./database.ts";
import config from "./config.ts";
import { getDebugKeyboard, getKeyboard } from "./keyboards.ts";
import { handleAvito } from "./avito/index.ts";
import { getInfo } from "./bikeinn/index.ts";
import { handleBikeinn } from "./bikeinn/handler.ts";

/** HTTP server */
Deno.serve({ port: 3000 }, async (_req) => {
  await handleBikeinn();

  await handleAvito();

  return new Response("ok");
});

const bot = new Telegraf(config.TOKEN);

export const notifySubscribers = async (message: string) => {
  const entries = db.getSubscribedUsers();
  for await (const entry of entries) {
    await bot.telegram.sendMessage(
      entry.key[1].toString(),
      message,
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
};

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
};

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
        case "Веб ссылки":
          {
            let msg = "";
            Object.entries(BIKES).forEach(([bike, data]) => {
              msg += `${bike}\n${data.webUrl}\n`;
            });
            ctx.reply(msg);

            break;
          }
        case "Avito" : {
          const count = await handleAvito();
          ctx.reply(count?.toString() || 'Нет информации');
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

    prepareBikesButtonsHears();
    prepareExtraButtonsHears();
    prepareDebugButtons();

    bot.launch().then(() => console.log("Bot launched successfully"));
  } catch (error) {
    console.error("Error initializing bot:", error);
  }
})();
