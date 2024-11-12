// apps/backend/src/services/ratingService.ts
import { IRating } from "@repo/interfaces";
import * as ratingRepository from "../repositories/ratingRepository";
import logger from "../utils/logger";
import { NotFoundError } from "../utils/error";

// Create a rating
export const createRating = async (ratingData: Partial<IRating>, transaction_id: string) => {
    logger.info("Creating rating...");

    const rating = await ratingRepository.createRating({
        ...ratingData,
        transaction_id,
    });
    return rating;
};

// Search ratings
export const searchRatings = async (searchTerm: string) => {
    logger.info(`Searching ratings with term: ${searchTerm}`, searchTerm);
    return await ratingRepository.listAllRatingsWithSearch(searchTerm);
};

// Get all ratings
export const getRatings = async () => {
    logger.info("Fetching all ratings");
    return await ratingRepository.getRatings();
};

// Get rating by id
export const getRatingById = async (rating_id: string) => {
    logger.info(`Fetching rating: ${rating_id}`, rating_id);

    const rating = await ratingRepository.findRatingById(rating_id);
    if (!rating) {
        throw new NotFoundError("Rating not found");
    }

    return rating;
};
