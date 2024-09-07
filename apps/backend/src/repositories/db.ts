/* 
Your application should generally only create one instance of PrismaClient.
How to achieve this depends on whether you are using Prisma ORM in a long-running application or in a serverless environment.
The reason for this is that each instance of PrismaClient manages a connection pool, which means that a large number of clients
can exhaust the database connection limit. This applies to all database connectors. 

In long-running applications, we recommend that you:
✔ Create one instance of PrismaClient and re-use it across your application
✔ Assign PrismaClient to a global variable in dev environments only to prevent hot reloading from creating new instances
*/

import { PrismaClient } from "@prisma/client";

// Create a global variable to store the PrismaClient instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Create a new PrismaClient instance if it doesn't already exist
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
