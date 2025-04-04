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

export abstract class BotHandler {
    public abstract handle(bot: Bot): unknown;

    public getName() {
        return this.constructor.name;
    }
}
