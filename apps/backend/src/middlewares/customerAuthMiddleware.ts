// Checks if a customer is authenticated before allowing access to certain routes
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as tokenRepository from "../repositories/tokenRepository";


// Authenticate users using JWT
export const customerAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    // Check if JWT is present
    if (!token) {
        return res.status(401).json({ message: "Unauthorised" });
    }

    // Check if JWT is correct
    try {
        // Check if the token is blacklisted
        const blacklistedToken = await tokenRepository.findToken(token);

        if (blacklistedToken) {
            return res.status(401).json({ message: 'Token is blacklisted. Please log in again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.body.customer_id = (decoded as any).customer_id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token"});
    }
};
