import { BikeInfo, BotHandler } from "../types.ts";
import { BIKES } from "../constants.ts";
import { getInfo } from "./api.ts";
import db from "../database.ts";
import { Logger } from "../common/logger.ts";
import { Bot } from "../bot.ts";


export class BikeinnHandler extends BotHandler {
    private logger = new Logger("BikeinnHandler");

    public async handle(bot: Bot) {
        this.logger.info('handle')

        const requestsPromises: Promise<{
            bike: string;
            bikeInfo: BikeInfo;
        }>[] = [];

        Object.entries(BIKES).map(([bike, data]) => {
            requestsPromises.push(
                new Promise((resolve) => {
                    getInfo(data.dataUrl).then((bikeInfo) => {
                        resolve({
                            bike,
                            bikeInfo,
                        });
                    });
                }),
            );
        });

        const responses = await Promise.all(requestsPromises);

        for (const { bike, bikeInfo } of responses) {
            const prevPrice = await db.getCurrentPrice(bike) as number | undefined;
            const currentPrice = bikeInfo.price;

            if (!prevPrice) {
                await db.setCurrentPrice(bike, currentPrice);
                return;
            }

            if (currentPrice !== prevPrice) {
                await db.setCurrentPrice(bike, currentPrice);
                await bot.notifySubscribers(`У ${bike}\nНовая цена: ${currentPrice} (${currentPrice - prevPrice > 0 ? '+' : ''} ${currentPrice - prevPrice})`);
            }
        }
    }
}

export const bikeinnHanlder = new BikeinnHandler();
