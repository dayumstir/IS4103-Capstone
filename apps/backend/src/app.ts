// Main application file where Express is configured, middleware is applied, and routes are registered

import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";
import dotenv from 'dotenv';


import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";

const app = express();

// Middleware setup
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));

dotenv.config(); // Load environment variables

// Routes
app.use("/auth", authRoutes);
app.use("/customer", customerRoutes);

// Dummy route for the root
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend server is running!' });
});

export default app;