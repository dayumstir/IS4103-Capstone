// app/backend/src/services/adminService.ts
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { IAdmin, AdminType } from "@repo/interfaces";
import { UserType } from "../interfaces/userType";
import * as adminRepository from "../repositories/adminRepository";
import logger from "../utils/logger";
import { NotFoundError, BadRequestError } from "../utils/error";

// Get admin by ID
export const getById = async (admin_id: string) => {
  logger.info(`Fetching admin profile for ID: ${admin_id}`);
  const admin = await adminRepository.findAdminById(admin_id);
  if (!admin) {
      throw new NotFoundError("Admin not found");
  }
  return admin;
};

// Update admin profile
export const update = async (admin_id: string, updateData: Partial<IAdmin>) => {
  logger.info(`Updating admin profile for ID: ${admin_id}`);
  const admin = await adminRepository.updateAdmin(admin_id, updateData);
  if (!admin) {
      throw new NotFoundError("Admin not found");
  }
  return admin;
};

// Generate random password with specified character sets
const generateRandomPassword = (length = 8) => {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialChars = "!@#$%^&*";
  const allChars = lowerCase + upperCase + digits + specialChars;
  
  let password = lowerCase[Math.floor(Math.random() * lowerCase.length)] +
                 upperCase[Math.floor(Math.random() * upperCase.length)] +
                 digits[Math.floor(Math.random() * digits.length)] +
                 specialChars[Math.floor(Math.random() * specialChars.length)];

  for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split("").sort(() => 0.5 - Math.random()).join("");
};

// Add new admin
export const add = async (adminData: IAdmin) => {
  logger.info(`Adding new admin with username: ${adminData.username}`);

  const { username, email, password } = adminData;
  const existingAdminEmail = await adminRepository.findAdminByEmail(email);
  const existingAdminUsername = await adminRepository.findAdminByUsername(username);
  
  if (existingAdminEmail) {
      throw new BadRequestError("Admin email already exists");
  } 
  if (existingAdminUsername) {
      throw new BadRequestError("Admin username already exists");
  }

  const generatedPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(password || generatedPassword, 10);

  const newAdmin = await adminRepository.createAdmin({
      ...adminData,
      password: hashedPassword,
      admin_type: AdminType.UNVERIFIED,
  });

  const jwtToken = jwt.sign(
      { 
          role: UserType.ADMIN, 
          admin_id: newAdmin.admin_id, 
          email: newAdmin.email,
          admin_type: newAdmin.admin_type  
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
  );

  // TODO: Evaluate if username, password should be sent in response
  return { jwtToken, admin: newAdmin, username, password: password || generatedPassword };
};

// Send email verification
export const sendEmailVerification = async (email: string, username: string, password: string) => {
  logger.info(`Sending email verification to ${email}`);
  
  const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "2525"),
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
      },
  });

  await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Admin Account Created",
      text: `Username: ${username}, Password: ${password}`,
  });
};

// Fetch all admins
export const getAllAdmins = async () => {
  logger.info("Fetching all admins");
  return await adminRepository.findAllAdmins();
};

// Deactivate admin
export const deactivateAdmin = async (admin_id: string) => {
  logger.info(`Deactivating admin with ID: ${admin_id}`);
  const admin = await adminRepository.updateAdmin(admin_id, { admin_type: AdminType.DEACTIVATED });
  if (!admin) {
      throw new NotFoundError("Admin not found");
  }
  return admin;
};

// Activate admin
export const activateAdmin = async (admin_id: string) => {
  logger.info(`Activating admin with ID: ${admin_id}`);
  const admin = await adminRepository.updateAdmin(admin_id, { admin_type: AdminType.NORMAL });
  if (!admin) {
      throw new NotFoundError("Admin not found");
  }
  return admin;
};
