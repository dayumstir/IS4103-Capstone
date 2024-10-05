// src/index.ts

import app from "./app";
import { connectDatabase } from "./config/database.config";
import { cleanupExpiredTokens } from "./utils/tokenCleanup";
import logger from "./utils/logger";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to the database
        await connectDatabase();

        // Cleanup expired tokens when the server starts
        await cleanupExpiredTokens();

        // Start the server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error: any) {
        logger.error("Failed to start the server. Error:", error.message);
        process.exit(1);
    }
};
    
startServer();
