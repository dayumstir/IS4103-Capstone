// A logging utility
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

// Define the custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create the logger instance
const logger = createLogger({
    level: 'debug', // Set the default log level (can be adjusted based on the environment)
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamps
        colorize(), // Colorize output for the console
        logFormat // Use the custom log format
    ),
    transports: [
        // Print logs to the console
        new transports.Console(),
        
        // Save logs to a file
        // new transports.File({ filename: 'logs/app.log' }),
    ],
});

export default logger;
