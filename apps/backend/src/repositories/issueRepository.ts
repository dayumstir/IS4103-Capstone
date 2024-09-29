// Handles database operations related to instalment plans
import { prisma } from "./db";
import { IIssue, IssueFilter } from "../interfaces/issueInterface";

// Create a new instalment plan in db
export const createIssue = async (issueData: IIssue) => {
    return prisma.issue.create({ data: issueData });
};

export const getIssues = async (issueFilter: IssueFilter) => {
    const { sorting, create_from, create_to, update_from, update_to, ...filter } = issueFilter;
    const whereClause = {
        ...filter,
        ...(create_from && { create_time: { gte: create_from } }),
        ...(create_to && { create_time: { lte: create_to } }),
        ...(update_from && { updated_at: { gte: update_from } }),
        ...(update_to && { updated_at: { lte: update_to } }),
    };
    return prisma.issue.findMany({
        where: whereClause,
        orderBy: sorting ? { [sorting.sortBy]: sorting.sortDirection } : { updated_at: "desc" },
        include: {
            merchant: true, // Fetch associated merchant
            customer: true, // Fetch associated customer
            admin: true, // Fetch associated admin
        },
    });
};

export const findIssueById = async (issue_id: string) => {
    return prisma.issue.findUnique({ where: { issue_id } });
};