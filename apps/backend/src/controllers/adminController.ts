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


export const edit= async (req: Request, res: Response) => {
    try {
        const updatedAdmin = await adminService.update(req.body.admin_id, req.body);
        res.status(200).json(updatedAdmin);
    } catch(error: any) {
        res.status(400).json({ error: error.message });
    }
};
