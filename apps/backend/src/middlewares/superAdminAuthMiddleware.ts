// apps/backend/src/middlewares/superAdminAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AdminType } from "@repo/interfaces";

export const superAdminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const admin_type = req.admin_type;

        // Log the admin type for debugging purposes
        logger.info(`SuperAdminAuthMiddleware: Admin type detected: ${admin_type}`);

        // Check if the user is a superadmin
        if (admin_type !== AdminType.SUPER) {
            logger.warn(`Unauthorized access attempt: Admin type is ${admin_type}`);
            return res.status(403).json({ message: "Forbidden: Superadmin access required" });
        }

        logger.info("Superadmin access granted.");
        next();
    } catch (error) {
        logger.error("Error in SuperAdminAuthMiddleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
