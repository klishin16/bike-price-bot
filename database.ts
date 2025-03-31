import { BikeKey, KVPrefix } from "./constants.ts";

const kv = await Deno.openKv();

const getSubscribedUsers = () => {
  return kv.list({ prefix: [KVPrefix.NOTIFY_SUBSCRIPTION] });
};

const isUserSubscribed = async (chatId: number) => {
  const res = await kv.get([KVPrefix.NOTIFY_SUBSCRIPTION, chatId]);
  return !!res.value;
};

const setSubscribed = (chatId: number) => {
  return kv.set([KVPrefix.NOTIFY_SUBSCRIPTION, chatId], 1);
}

const deleteSubscription = (chatId: number) => {
  return kv.delete([KVPrefix.NOTIFY_SUBSCRIPTION, chatId]);
}

const getCurrentPrice = async (bikeKey: BikeKey) => {
  const res = await kv.get([KVPrefix.PRICE, bikeKey]);
  return res.value;
}

const setCurrentPrice = (bikeKey: BikeKey, price: number) => {
  return kv.set([KVPrefix.PRICE, bikeKey], price);
}

/** Абстракции */
// TODO param: string[] | string
const setNumber = (key: string, value: number) => kv.set([key], value);

const getNumber = async (key: string): Promise<number> => {
  const res = await kv.get([key]);
  return res.value as number;
}

const db = {
  getSubscribedUsers,
  isUserSubscribed,
  setSubscribed,
  deleteSubscription,
  getCurrentPrice,
  setCurrentPrice,
  setNumber,
  getNumber,
}

export default db;
