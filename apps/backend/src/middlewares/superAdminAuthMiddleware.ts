import { Request, Response, NextFunction } from "express";
import { AdminType } from "@repo/interfaces";

export const superAdminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const admin_type = req.admin_type;

    // Check if the user is a superadmin
    if (admin_type !== AdminType.SUPER) {
        return res.status(403).json({ message: "Forbidden: Superadmin access required" });
    }

    next();
};
