import db from "./database.ts";
import { BIKES, DebugButtons, ExtraButtons } from "./constants.ts";
import { splitIntoPairs } from "./utils.ts";
import config from "./config.ts";
import { Markup } from "npm:telegraf";

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
