// Contains the business logic related to instalment plans
import { IIssue, IssueFilter, IssueStatus } from "../interfaces/issueInterface";
import * as issueRepository from "../repositories/issueRepository";
import logger from "../utils/logger";

export const createIssue = async (issueData: IIssue, issueImages?: Buffer[]) => {
    logger.info("Executing createIssue...");
    const issue = await issueRepository.createIssue({
        ...issueData,
        images: issueImages,
        status: IssueStatus.PENDING_OUTCOME,
    });
    return issue;
};
export const getIssues = async (issueFilter: IssueFilter) => {
    logger.info("Executing getIssues...");
    const issues = await issueRepository.getIssues(issueFilter);
    return issues;
};

export const getIssueById = async (issue_id: string) => {
    logger.info("Executing getIssueById...");
    const issue = await issueRepository.findIssueById(issue_id);
    if (!issue) {
        throw new Error("Issue not found");
    }
    return issue;
};


export const updateIssue = async (issue_id: string, updateData: Partial<IIssue>) => {
    logger.info('Executing updateIssue...');

    const issue = await issueRepository.updateIssue(issue_id, updateData);
    if (!issue) {
        throw new Error("Issue not found");
    }
    return issue;
};

export const searchIssues = async (searchQuery) => {
    logger.info(`Searching for issues with query: ${searchQuery}`);
    const issues = await issueRepository.listAllIssuesWithSearch(searchQuery);
    if (!issues.length) {
        logger.warn("No issues found matching the search criteria");
        return [];
    }
    return issues;
};