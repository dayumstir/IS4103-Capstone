// apps/backend/src/index.ts
import dotenv from "dotenv";
import app from "./app";
import logger from "./utils/logger";
import { connectDatabase } from "./config/database.config";
import { cleanupExpiredTokens } from "./utils/tokenCleanup";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to the database
        await connectDatabase();
        logger.info("Database connection established successfully");

        // Cleanup expired tokens when the server starts
        await cleanupExpiredTokens();
        logger.info("Expired tokens cleanup completed");

        // Start the server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error: any) {
        logger.error(`Failed to start the server. Error: ${error.message}`);
        process.exit(1);
    }
};
    
startServer();
