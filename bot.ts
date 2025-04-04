import { Telegraf } from "npm:telegraf";
import config from "./config.ts";
import { BotHandler } from "./types.ts";
import db from "./database.ts";
import { botHandlerFactory, getKeyboard } from "./keyboards.ts";
import { Logger } from "./common/logger.ts";

export class Bot {
  private readonly logger = new Logger("Bot");
  private readonly tgBot: Telegraf;

  constructor(private handlers: BotHandler[]) {
    this.tgBot = new Telegraf(config.TOKEN);
  }

  public processHandlers() {
    this.logger.info('Process handlers')
    return Promise.allSettled(
      this.handlers.map((handler) => handler.handle(this)),
    );
  }

  public async launch() {
    try {
      this.tgBot.start(async (ctx) => {
        ctx.replyWithHTML(
          "Добро пожаловать в <b>bike-price-bot</b>\n\n" +
            "Для получения цены используйте кнопки <b>ниже</b>",
          await getKeyboard(ctx.chat.id),
        );
      });
      const {
        prepareBikesButtonsHears,
        prepareExtraButtonsHears,
        prepareDebugButtons,
      } = botHandlerFactory(this.tgBot);

      prepareBikesButtonsHears();
      prepareExtraButtonsHears();
      prepareDebugButtons();

      this.tgBot.launch();
      this.logger.info("Bot launch successfully");
      this.logger.info(
        `Handlers: ${
          this.handlers.map((handler) => handler.getName()).join(", ")
        }`,
      );
    } catch (error) {
      console.error("Error initializing bot:", error);
    }
  }

  public async notifySubscribers(message: string) {
    const entries = db.getSubscribedUsers();
    for await (const entry of entries) {
      await this.tgBot.telegram.sendMessage(
        entry.key[1].toString(),
        message,
      );
    }
  }
}
