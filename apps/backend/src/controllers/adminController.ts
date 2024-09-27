// Manages admin-related actions
import { Request, Response } from "express";
import * as adminService from "../services/adminService";


export const get = async(req: Request, res: Response) => {
    try {
        const admin = await adminService.getById(req.body.admin_id);
        res.status(200).json(admin);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const getAll = async(req: Request, res: Response) => {
    try {
        const admins = await adminService.getAllAdmins();
        res.status(200).json(admins);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const activateAdmin = async(req: Request, res: Response) => {
    try {
        const admins = await adminService.activateAdmin(req.body.admin_id);
        res.status(200).json(admins);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const deactivateAdmin = async(req: Request, res: Response) => {
    try {
        const admins = await adminService.deactivateAdmin(req.body.admin_id);
        res.status(200).json(admins);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAdminProfile = async(req: Request, res: Response) => {
    try {
        const admin_id = req.params.admin_id || req.body.admi;

        const admin = await adminService.getById(admin_id);
        res.status(200).json(admin);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const edit= async (req: Request, res: Response) => {
    try {
        const updatedAdmin = await adminService.update(req.body.admin_id, req.body);
        res.status(200).json(updatedAdmin);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};
