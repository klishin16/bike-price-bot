import db from "./database.ts";
import { BIKES, DebugButtons, DebugButtonsKey, ExtraButtons, ExtraButtonsKey } from "./constants.ts";
import { splitIntoPairs } from "./utils.ts";
import config from "./config.ts";
import { Context, Markup, Telegraf } from "npm:telegraf";
import { getInfo, handleAvito } from "./bikeinn/index.ts";
import { AVITO_SPECIALIZEDES_URL } from "./avito/index.ts";

export const getKeyboard = async (chatId: number) => {
    const isSubscribed = await db.isUserSubscribed(chatId);
    const isAdminChat = chatId === config.ADMIN_CHAT_ID;

    const extraButtons = Object.entries(ExtraButtons).reduce<string[]>(
        (buttons, [button, fn]) => {
            if (fn(isSubscribed, isAdminChat)) {
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

export const getDebugKeyboard = () => {
    return Markup.keyboard(
        splitIntoPairs(Object.keys(DebugButtons)),
    ).resize();
};

export const botHandlerFactory = (bot: Telegraf) => {
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
                    case "Avito":
                        ctx.reply(AVITO_SPECIALIZEDES_URL);
                        break;
                    case "Debug":
                        ctx.reply("Enter debug mode", getDebugKeyboard());
                        break;
                    default:
                        ctx.reply("Увы, нет");
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
                    case "Avito count" : {
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

    return {
        prepareBikesButtonsHears,
        prepareExtraButtonsHears,
        prepareDebugButtons,
    }
}
