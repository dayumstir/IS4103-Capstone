// Handles database operations related to instalment plans
import { prisma } from "./db";
import { IIssue, IssueFilter } from "../../../../packages/interfaces/issueInterface";

// Create a new instalment plan in db
export const createIssue = async (issueData: IIssue) => {
    return prisma.issue.create({ data: issueData });
};

export const getIssues = async (issueFilter: IssueFilter) => {
    const { sorting, create_from, create_to, update_from, update_to, search_term, ...filter } =
        issueFilter;
    return prisma.issue.findMany({
        where: {
            ...filter,
            AND: [
                { create_time: { lte: create_to } },
                { create_time: { gte: create_from } },
                { updated_at: { gte: update_from } },
                { updated_at: { lte: update_to } },
            ],
            ...(search_term && {
                OR: [
                    { title: { contains: search_term, mode: "insensitive" } },
                    { description: { contains: search_term, mode: "insensitive" } },
                ],
            }),
        },
        orderBy: sorting ? { [sorting.sortBy]: sorting.sortDirection } : { updated_at: "desc" },
        select: {
            issue_id: true,
            title: true,
            description: true,
            category: true,
            outcome: true,
            status: true,
            create_time: true,
            updated_at: true,
            merchant_id: true,
            customer_id: true,
            admin_id: true,

            transaction: true,
            merchantPayment: true,
        },
    });
};

export const findIssueById = async (issue_id: string) => {
    return prisma.issue.findUnique({
        where: { issue_id },
        include: { transaction: true, merchantPayment: true },
    });
};

// update issue
export const updateIssue = async (issue_id: string, updateData: Partial<IIssue>) => {
    return prisma.issue.update({
        where: { issue_id: issue_id },
        data: updateData,
    });
};

// Search Issues
export const listAllIssuesWithSearch = async (search: string) => {
    return prisma.issue.findMany({
        where: {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: {
            issue_id: true,
            title: true,
            description: true,
            outcome: true,
            status: true,
            create_time: true,
            updated_at: true,
            merchant_id: true,
            customer_id: true,
            admin_id: true,
            
            transaction: true,
            merchantPayment: true,
        },
    });
};
