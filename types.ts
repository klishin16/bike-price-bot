import { Bot } from "./bot.ts";

export interface BikeInfo {
    model: string;
    price: number;
}

export interface BikeData {
    dataUrl: string;
    imageUrl: string;
    webUrl: string;
}

export interface BotHandler {
    handle: (bot: Bot) => unknown;
}
