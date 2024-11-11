// app/backend/src/controllers/ratingController.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import * as ratingService from "../services/ratingService";
import { BadRequestError } from "../utils/error";

// Create a rating
export const createRating = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing createRating...");
    const { transaction_id } = req.body;

    if (!transaction_id) {
        return next(new BadRequestError("transaction_id is required"));
    }

    try {
        const newRating = await ratingService.createRating(req.body, transaction_id);
        res.status(201).json(newRating);
    } catch (error: any) {
        logger.error("Error in createRating:", error);
        next(error);
    }
};

// Get all ratings
export const getRatings = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getRatings...");

    try {
        const { search } = req.query;
        const ratings = search 
            ? await ratingService.searchRatings(search as string)
            : await ratingService.getRatings();
        res.status(200).json(ratings);
    } catch (error: any) {
        logger.error("Error in getRatings:", error);
        next(error);
    }
};

// Get a rating by id
export const getRating = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getRating...");
    const { rating_id } = req.params;

    try {
        const rating = await ratingService.getRatingById(rating_id);
        res.status(200).json(rating);
    } catch (error: any) {
        logger.error("Error in getRating:", error);
        next(error);
    }
};
