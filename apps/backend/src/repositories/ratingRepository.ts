// apps/backend/src/repositories/ratingRepository.ts
import { prisma } from "./db";
import { IRating } from "@repo/interfaces";

// Create a rating
export const createRating = async (ratingData: Partial<IRating>) => {
    return await prisma.rating.create({
        data: ratingData,
    });
};

// Search ratings
export const listAllRatingsWithSearch = async (searchTerm: string) => {
    return await prisma.rating.findMany({
        where: {
            OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { rating: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
            ],
        },
    });
};

// Get all ratings
export const getRatings = async () => {
    return await prisma.rating.findMany();
};

// Get rating by id
export const findRatingById = async (rating_id: string) => {
    return await prisma.rating.findUnique({
        where: { rating_id },
        include: {
            transaction: {
                include: {
                    customer: true, // Include customer details
                    merchant: true, // Include merchant details
                },
            },
        },
    });
};
