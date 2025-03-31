export  async function readAvitoPage(pagePath: string): Promise<string> {
    try {
        return await Deno.readTextFile(pagePath);
    } catch (error) {
        console.error("Failed to read file:", error);
        throw error;
    }
}

export  async function writeAvitoPage(pagePath: string, page: string) {
    try {
        return await Deno.writeTextFile(pagePath, page);
    } catch (error) {
        console.error("Failed to write file:", error);
        return null;
    }
}
