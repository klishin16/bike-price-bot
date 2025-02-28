export const PRICE_KEY = "precio_win_164";

export const BIKES: Record<string, { dataUrl: string; imageUrl: string }> = {
  "Turbo Levo SL Comp (2023)": {
    dataUrl: "https://dc.tradeinn.com/139955533",
    imageUrl:
      "https://www.tradeinn.com/f/13995/139955533_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-comp-carbon-29-gx-eagle-2023.webp",
  },
  "Turbo Levo SL Expert (2023)": {
    dataUrl: "https://dc.tradeinn.com/140247111",
    imageUrl:
      "https://www.tradeinn.com/f/14024/140247111_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-expert-29-27.5-gx-eagle-2023.webp",
  },
  "Turbo Levo SL Comp (2024)": {
    dataUrl: "https://dc.tradeinn.com/141212702",
    imageUrl:
      "https://www.tradeinn.com/m/14121/141212702_2/specialized-%D0%93%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-levo-sl-comp-29-27.5-gx-eagle-2024.webp",
  },
  "Turbo Levo SL Expert (2024)": {
    dataUrl: "https://dc.tradeinn.com/140851839",
    imageUrl:
      "https://www.tradeinn.com/f/14085/140851839_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-levo-sl-expert-carbon-29-27.5-2024.webp",
  },
  "Turbo Levo SL Expert (2025)": {
    dataUrl: "https://dc.tradeinn.com/141334895",
    imageUrl:
      "https://www.tradeinn.com/f/14133/141334895_2/specialized-%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9-%D0%B3%D0%BE%D1%80%D0%BD%D1%8B%D0%B9-%D0%B2%D0%B5%D0%BB%D0%BE%D1%81%D0%B8%D0%BF%D0%B5%D0%B4-turbo-levo-sl-expert-carbon-29-27.5-gx-eagle-2025.webp",
  },
};

export const ExtraButtons: Record<string, (isSubscribed: boolean) => boolean> ={
  "Можно заказать?🥺": () => true,
  "Подписаться на изменения цены": (isSubscribed) => !isSubscribed,
  "Прекратить подписку": (isSubscribed) => isSubscribed,
  "Debug": () => true,
} as const

export type ExtraButtonsKeys = keyof typeof ExtraButtons;

export const DebugButtons ={
  "Список подписчиков": 'europe',
  "Тест уведомления": 'subscription-test',
  "Exit debug": 'exit-debug',
} as const

export type DebugButtonsKeys = keyof typeof DebugButtons;
