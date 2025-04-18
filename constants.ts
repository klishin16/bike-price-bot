import { BikeData } from "./types.ts";

export const PRICE_KEY = "precio_win_164";

export const BIKES: Record<string, BikeData> = {
  "Turbo Levo SL Comp (2023)": {
    dataUrl: "https://dc.tradeinn.com/139955533",
    imageUrl:
      "https://www.tradeinn.com/f/13995/139955533_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-comp-carbon-29-gx-eagle-2023.webp",
    webUrl: "https://www.tradeinn.com/bikeinn/ru/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-comp-carbon-29-gx-eagle-2023/139955533/p",
  },
  "Turbo Levo SL Expert (2023)": {
    dataUrl: "https://dc.tradeinn.com/140247111",
    imageUrl:
      "https://www.tradeinn.com/f/14024/140247111_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-expert-29-27.5-gx-eagle-2023.webp",
    webUrl:
      "https://www.tradeinn.com/bikeinn/ru/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-expert-29-27.5-gx-eagle-2023/140247111/p",
  },
  "Turbo Levo SL Comp (2024)": {
    dataUrl: "https://dc.tradeinn.com/141212702",
    imageUrl:
      "https://www.tradeinn.com/f/14121/141212702_2/specialized-%D0%93%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-levo-sl-comp-29-27.5-gx-eagle-2024.webp",
    webUrl: "https://www.tradeinn.com/bikeinn/ru/specialized-%D0%93%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-levo-sl-comp-29-27.5-gx-eagle-2024/141212702/p",
  },
  "Turbo Levo SL Expert (2024)": {
    dataUrl: "https://dc.tradeinn.com/140851839",
    imageUrl:
      "https://www.tradeinn.com/f/14085/140851839_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-levo-sl-expert-carbon-29-27.5-2024.webp",
    webUrl: "",
  },
  "Turbo Levo SL Expert (2025)": {
    dataUrl: "https://dc.tradeinn.com/141334895",
    imageUrl:
      "https://www.tradeinn.com/f/14133/141334895_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-expert-carbon-29-27.5-gx-eagle-2025.webp",
    webUrl: "",
  },
} as const;

export type BikeKey = keyof typeof BIKES;

export const ExtraButtons: Record<
  string,
  (isSubscribed: boolean, isAdminChat: boolean) => boolean
> = {
  // "Можно заказать?🥺": () => true,
  "Подписаться на изменения цены": (isSubscribed) => !isSubscribed,
  "Прекратить подписку": (isSubscribed) => isSubscribed,
  "Avito": () => true,
  "Debug": (_, isAdminChat) => isAdminChat,
} as const;

export type ExtraButtonsKey = keyof typeof ExtraButtons;

export const DebugButtons = {
  "Список подписчиков": "europe",
  "Тест уведомления": "subscription-test",
  "Веб ссылки": "web-links",
  "Avito count": 'avito',
  "Exit debug": "exit-debug",
} as const;

export type DebugButtonsKey = keyof typeof DebugButtons;

export const KVPrefix = {
  NOTIFY_SUBSCRIPTION: "NOTIFY_SUBSCRIPTION",
  PRICE: "PRICE",
} as const;
