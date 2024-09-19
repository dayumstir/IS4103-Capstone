// Checks if a admin is authenticated before allowing access to certain routes
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as jwtTokenRepository from "../repositories/jwtTokenRepository";

// Authenticate users using JWT
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
            return res.status(401).json({ message: 'Token is blacklisted. Please log in again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.body.admin_id = (decoded as any).admin_id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token"});
    }
};