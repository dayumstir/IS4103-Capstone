// Manages admin-related actions
import { Request, Response } from "express";
import * as adminService from "../services/adminService";


export const getAdmin = async(req: Request, res: Response) => {
    try {
        const admin = await adminService.getAdminById(req.body.admin_id);
        res.status(200).json(admin);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};


export const editAdmin = async (req: Request, res: Response) => {
    try {
        const updatedAdmin = await adminService.updateAdmin(req.body.admin_id, req.body);
        res.status(200).json(updatedAdmin);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};