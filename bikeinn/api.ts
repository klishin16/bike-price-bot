import { BikeInfo } from "../types.ts";
import { PRICE_KEY } from "../constants.ts";

export const getInfo = async (
    url: string,
): Promise<BikeInfo> => {
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
};
