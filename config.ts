const TOKEN = Deno.env.get("BOT_TOKEN");
if (!TOKEN) {
    throw new Error("Bot token doesn't exist");
}
const ADMIN_CHAT_ID = parseInt(Deno.env.get("ADMIN_CHAT_ID") ?? "0");

export default {
    TOKEN,
    ADMIN_CHAT_ID
}
