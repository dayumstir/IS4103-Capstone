// src/config/database.config.ts

import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";

const prisma = new PrismaClient();

export const connectDatabase = async () => {
    try {
        // Test the connection to the db by making a query
        await prisma.$connect();
        logger.info("Connected to AWS RDS successfully");
    } catch (error) {
        logger.error("Error connecting to the database: ", error);
        throw error;
    }
};

// Close the connection when the application terminates
export const closeDatabaseConnection = async () => {
    try {
        await prisma.$disconnect();
        logger.info("Disconnected from AWS RDS");
    } catch (error) {
        logger.error("Error disconnecting from the database: ", error);
    }
};

export default prisma;
