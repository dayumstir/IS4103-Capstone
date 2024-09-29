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
