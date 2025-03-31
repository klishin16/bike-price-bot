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
const setValue = (key: string, value: number | string) => kv.set([key], value);

const getValue = async <T extends number | string>(key: string): Promise<T> => {
  const res = await kv.get([key]);
  return res.value as T;
}

const writeLargeString = async (key: string, content: string, chunkSize = 32000) => {
  console.log('Content size', content.length);
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  await kv.set([key, "chunks"], chunks.length);
  for (let i = 0; i < chunks.length; i++) {
    await kv.set([key, `chunk_${i}`], chunks[i]);
  }
}

const readLargeString = async (key: string) => {
  const chunkCount = (await kv.get<number>([key, "chunks"])).value;
  if (chunkCount === null) return null;

  let content = "";
  for (let i = 0; i < chunkCount; i++) {
    const chunk = (await kv.get<string>([key, `chunk_${i}`])).value;
    if (chunk) content += chunk;
  }
  return content;
}


const db = {
  getSubscribedUsers,
  isUserSubscribed,
  setSubscribed,
  deleteSubscription,
  getCurrentPrice,
  setCurrentPrice,
  setValue,
  getValue,
  writeLargeString,
  readLargeString,
}

export default db;
