import { Telegraf } from "npm:telegraf";
import db from "./database.ts";
import config from "./config.ts";
import { botHandlerFactory, getKeyboard } from "./keyboards.ts";
import { handleAvito } from "./avito/index.ts";
import { handleBikeinn } from "./bikeinn/handler.ts";
import { Logger } from "./common/logger.ts";


const logger = new Logger();

/** HTTP server */
const PORT = Number(Deno.env.get('PORT') || 3000)
Deno.serve({ port: PORT }, async (_req) => {
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

    const { prepareBikesButtonsHears, prepareExtraButtonsHears, prepareDebugButtons } = botHandlerFactory(bot);

    prepareBikesButtonsHears();
    prepareExtraButtonsHears();
    prepareDebugButtons();

    bot.launch().then(() => logger.info('Bot launched successfully'));
  } catch (error) {
    console.error("Error initializing bot:", error);
  }
})();
