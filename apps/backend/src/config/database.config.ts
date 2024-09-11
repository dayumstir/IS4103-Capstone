// Configuration specific to AWS RDS
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDatabase = async() => {
    try {
        // Test the connection to the db by making a query
        await prisma.$connect();
        console.log("Connected to AWS RDS successfully");
    } catch (error) {
        console.log("Error connecting to the database: ", error);
        throw error;  // Caught in index.ts
    }
}

export default prisma;  // Export the Prisma client for use in other files
