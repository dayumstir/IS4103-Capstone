// Handles database operations related to instalment plans
import { prisma } from "./db";
import { IDispute } from "../interfaces/disputeInterface";

// Create a new instalment plan in db
export const createDispute = async (disputeData: IDispute) => {
    return prisma.dispute.create({ data: disputeData });
};
