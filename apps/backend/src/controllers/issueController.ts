// Manages instalment plan-related actions
import { Request, Response } from "express";
import * as issueService from "../services/issueService";

// Create Issue
export const createIssue = async (req: Request, res: Response) => {
    try {
        const customerMerchantFK = req.body.customer_id || req.body.merchant_id;
        if (!customerMerchantFK) {
            return res
                .status(400)
                .json({ error: "At least one of Merchant or Customer ID is required" });
        }
        const images = req.files as Express.Multer.File[];
        const issue = await issueService.createIssue(
            req.body,
            images.map((image: Express.Multer.File) => image.buffer)
        );
        res.status(201).json(issue);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Issues
export const getIssues = async (req: Request, res: Response) => {
    const { search } = req.query;
    try {
        let issues;
        if (search) {
            issues = await issueService.searchIssues(search);
        } else {
            issues = await issueService.getIssues(req.body);
        }
        res.status(201).json(issues);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Issue
export const getIssue = async (req: Request, res: Response) => {
    try {
        const issueId = req.params.issue_id;

        if (!issueId) {
            return res.status(400).json({ error: "Issue ID is required" });
        }
        const issue = await issueService.getIssueById(issueId);
        res.status(201).json(issue);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const editIssue = async (req: Request, res: Response) => {
    const id = req.params.issue_id || req.body.issue_id;
    try {
        const updatedIssue = await issueService.updateIssue(
            id,
            req.body,
        );
        res.status(200).json(updatedIssue);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};