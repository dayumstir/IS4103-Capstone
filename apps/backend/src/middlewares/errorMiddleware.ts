// Global error handling middleware
import { Request, Response } from "express";

// Error-handling middleware function
export const errorMiddleware = (err: any, req: Request, res: Response) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // If error has status code and message, send them
    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

export default errorMiddleware;