import { Logger } from "./common/logger.ts";
import { BotHandler } from "./types.ts";
import { avitoHanlder } from "./avito/index.ts";
import { Bot } from "./bot.ts";
import { bikeinnHanlder } from "./bikeinn/handler.ts";

const logger = new Logger();

/** Bot */
const handlers: BotHandler[] = [avitoHanlder, bikeinnHanlder];
const bot = new Bot(handlers);

/** HTTP server */
const PORT = Number(Deno.env.get("PORT") || 3000);

Deno.serve({
  port: PORT,
  onListen: ({ port, hostname }) => {
    logger.info(`Server started at http://${hostname}:${port}`);
    bot.launch();
  },
}, async (_req) => {
  await bot.processHandlers();

  return new Response("ok");
});

Deno.cron("Process handlers", "*/5 * * * *", async () => {
  await bot.processHandlers();
})
