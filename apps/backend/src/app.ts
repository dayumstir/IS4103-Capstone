// Main application file where Express is configured, middleware is applied, and routes are registered

import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";

const app = express();

// Middleware setup
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);

export default app;