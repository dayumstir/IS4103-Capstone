import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";
import { AdminType } from "../interfaces/adminTypeInterface";
import { UserType } from "../interfaces/userType";

declare global {
    namespace Express {
        interface Request {
            admin_id?: string;
            customer_id?: string;
            merchant_id?: string;
            admin_type?: AdminType;
        }
    }
}

// Combined Auth Middleware for Admin, Customer, and Merchant
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    // Check if JWT is present
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Check if the token is blacklisted
        const blacklistedToken = await jwtTokenRepository.findToken(token);
        if (blacklistedToken) {
            return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
        }

        // Decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Extract user type (admin, customer, or merchant) from JWT payload
        const { role, admin_id, customer_id, merchant_id, admin_type } = decoded;

        // Handle based on role
        switch (role) {
            case UserType.ADMIN:
                if (!admin_id)
                    return res.status(401).json({ message: "Unauthorized: Invalid admin token" });
                req.admin_id = admin_id; // Attach admin_id to the request object
                req.admin_type = admin_type; // Attach admin_type (admin/superadmin)
                break;
            case UserType.CUSTOMER:
                if (!customer_id)
                    return res
                        .status(401)
                        .json({ message: "Unauthorized: Invalid customer token" });
                req.customer_id = customer_id; // Attach customer_id to the request object
                break;
            case UserType.MERCHANT:
                if (!merchant_id)
                    return res
                        .status(401)
                        .json({ message: "Unauthorized: Invalid merchant token" });
                req.merchant_id = merchant_id; // Attach merchant_id to the request object
                break;
            default:
                return res.status(401).json({ message: "Unauthorized: Invalid user role" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
