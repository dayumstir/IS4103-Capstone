// Checks if a admin is authenticated before allowing access to certain routes
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import { AdminType } from "../interfaces/adminType";
import * as adminRepository from "../repositories/adminRepository";


// Extend the Request interface to include admin information
declare global {
    namespace Express {
        interface Request {
            admin?: {
            admin_id: string;
            };
        }
    }
}


// Middleware to authenticate regular admins using JWT
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    // Check if JWT is present
    if (!token) {
        return res.status(401).json({ message: "Unauthorised" });
    }

    // Check if JWT is correct
    try {
        // Check if the token is blacklisted
        const blacklistedToken = await jwtTokenRepository.findToken(token);

        if (blacklistedToken) {
            return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
        }

        // Decode the token and extract the admin_id
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const admin_id = (decoded as any).admin_id;

        // Attach the admin_id to req.admin instead of req.body
        req.admin = { admin_id };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token"});
    }
};


// Middleware to authenticate super admins using JWT
export const superAdminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    // Check if JWT is present
    if (!token) {
        return res.status(401).json({ message: "Unauthorised" });
    }

    // Check if JWT is correct
    try {
        // Check if the token is blacklisted
        const blacklistedToken = await jwtTokenRepository.findToken(token);

        if (blacklistedToken) {
            return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
        }

        // Decode the token and extract the admin_id
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const admin_id = (decoded as any).admin_id;

        // Attach the admin_id to req.admin instead of req.body
        req.admin = { admin_id };
         
        // Verify that the admin is a super admin
        const admin = await adminRepository.findAdminById(admin_id);
        if (admin && admin.admin_type !== AdminType.SUPER) {
            return res.status(403).json({ message: "Forbidden: You do not have super admin privileges."});
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token"});
    }
};
