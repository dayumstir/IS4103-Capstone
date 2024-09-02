// Handles authentication-related actions
import { Request, Response } from "express";
import * as authService from "../services/authService";

export const register = async (req: Request, res: Response) => {
    // TODO: Add error handling and error codes
    const customer = await authService.register(req.body);
    res.status(201).json(customer);
};