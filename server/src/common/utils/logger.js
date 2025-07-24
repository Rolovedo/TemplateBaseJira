// Logger simple para el sistema del Tablero
import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            if (typeof data === 'object') {
                logMessage += ` | Data: ${JSON.stringify(data, null, 2)}`;
            } else {
                logMessage += ` | Data: ${data}`;
            }
        }
        
        return logMessage;
    }

    writeToFile(filename, message) {
        try {
            const filePath = path.join(this.logDir, filename);
            fs.appendFileSync(filePath, message + '\n');
        } catch (error) {
            console.error('Error escribiendo al archivo de log:', error);
        }
    }

    info(message, data = null) {
        const logMessage = this.formatMessage('info', message, data);
        console.log('\x1b[36m%s\x1b[0m', logMessage); // Cyan
        this.writeToFile('api.log', logMessage);
    }

    warn(message, data = null) {
        const logMessage = this.formatMessage('warn', message, data);
        console.warn('\x1b[33m%s\x1b[0m', logMessage); // Yellow
        this.writeToFile('api.log', logMessage);
    }

    error(message, data = null) {
        const logMessage = this.formatMessage('error', message, data);
        console.error('\x1b[31m%s\x1b[0m', logMessage); // Red
        this.writeToFile('error-api.log', logMessage);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            const logMessage = this.formatMessage('debug', message, data);
            console.log('\x1b[35m%s\x1b[0m', logMessage); // Magenta
            this.writeToFile('api.log', logMessage);
        }
    }

    success(message, data = null) {
        const logMessage = this.formatMessage('success', message, data);
        console.log('\x1b[32m%s\x1b[0m', logMessage); // Green
        this.writeToFile('api.log', logMessage);
    }
}

export const logger = new Logger();
