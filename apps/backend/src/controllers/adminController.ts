// apps/backend/src/controllers/adminController.ts
import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/adminService";
import logger from "../utils/logger";
import { BadRequestError, UnauthorizedError } from "../utils/error";
import { AdminType } from "@repo/interfaces";

// Get own admin profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getProfile...");
    try {
        const admin_id = req.admin_id;
        if (!admin_id) {
            return next(new UnauthorizedError("admin_id is required"));
        }

        const admin = await adminService.getById(admin_id);
        res.status(200).json(admin);
    } catch (error: any) {
        logger.error("Error in getProfile:", error);
        next(error);
    }
};

// Get admin profile by ID
export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getProfileById...");
    try {
        const admin_id = req.params.admin_id;
        if (!admin_id) {
            return next(new BadRequestError("admin_id is required"));
        }

        const admin = await adminService.getById(admin_id);
        res.status(200).json(admin);
    } catch (error: any) {
        logger.error(`Error in getProfileById for admin_id: ${req.params.admin_id}`, error);
        next(error);
    }
};

// Edit admin profile
export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing editProfile...");
    try {
        const admin_id = req.admin_id;
        if (!admin_id) {
            return next(new UnauthorizedError("admin_id is required"));
        }

        const updatedAdmin = await adminService.update(admin_id, req.body);
        res.status(200).json(updatedAdmin);
    } catch (error: any) {
        logger.error("Error in editProfile:", error);
        next(error);
    }
};

// Add admin
export const addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing addAdmin...");
    try {
        const admin = await adminService.add(req.body);

        if (admin.admin.admin_type === AdminType.UNVERIFIED) {
            await adminService.sendEmailVerification(admin.admin.email, admin.admin.username, admin.password);
        }
        
        res.status(201).json(admin);
    } catch (error: any) {
        logger.error("Error in addAdmin:", error);
        next(error);
    }
};

// Get all admins
export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getAllAdmins...");
    try {
        const admins = await adminService.getAllAdmins();
        res.status(200).json(admins);
    } catch (error: any) {
        logger.error("Error in getAll:", error);
        next(error);
    }
};

// Deactivate admin
export const deactivateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing deactivateAdmin...");
    try {
        const admin_id = req.body.admin_id;
        if (!admin_id) {
            return next(new BadRequestError("admin_id is required"));
        }

        const admin = await adminService.deactivateAdmin(admin_id);
        res.status(200).json(admin);
    } catch (error: any) {
        logger.error("Error in deactivateAdmin:", error);
        next(error);
    }
};

// Activate admin
export const activateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing activateAdmin...");
    try {
        const admin_id = req.body.admin_id;
        if (!admin_id) {
            return next(new BadRequestError("admin_id is required"));
        }

        const admin = await adminService.activateAdmin(admin_id);
        res.status(200).json(admin);
    } catch (error: any) {
        logger.error("Error in activateAdmin:", error);
        next(error);
    }
};
