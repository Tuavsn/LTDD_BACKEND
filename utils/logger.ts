export class Logger {

    static info(message?: string, object?: any) {
        message && console.info(`[${new Date().toLocaleString()}] >>> ${message}`);
        object && console.info(object.json());
    }

    static warn(message?: string, object?: any) {
        message && console.warn(`[${new Date().toLocaleString()}] >>> ${message}`);
        object && console.warn(object.json());
    }

    static error(message?: string, object?: any) {
        message && console.error(`[${new Date().toLocaleString()}] >>> ${message}`);
        object && console.error(object.json());
    }
}