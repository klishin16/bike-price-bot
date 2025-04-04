export class Logger {
    private readonly name: string;

    constructor(name = "App") {
        this.name = name;
    }

    private format(level: string, msg: string): string {
        const time = new Date().toISOString();
        return `[${time}] [${this.name}] [${level.toUpperCase()}] ${msg}`;
    }

    debug(msg: string) {
        console.debug(`%c${this.format("debug", msg)}`, "color: gray");
    }

    info(msg: string) {
        console.info(`%c${this.format("info", msg)}`, "color: blue");
    }

    warn(msg: string) {
        console.warn(`%c${this.format("warn", msg)}`, "color: orange");
    }

    error(msg: string) {
        console.error(`%c${this.format("error", msg)}`, "color: red");
    }

    // Для логгирования в файл
    async toFile(level: string, msg: string, filepath = "./app.log") {
        const log = this.format(level, msg) + "\n";
        await Deno.writeTextFile(filepath, log, { append: true });
    }
}
