// Configuration specific to AWS RDS
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDatabase = async() => {
    try {
        // Test the connectioin to the db by making a query
        await prisma.$connect();
        console.log("Connected to AWS RDS successfully");
    } catch (err) {
        console.log("Error connecting to the database: ", err);
        throw err;  // Caught in index.ts
    }
}

export default prisma;  // Export the Prisma client for use in other files