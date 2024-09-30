// Main application file where Express is configured, middleware is applied, and routes are registered

import express from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRoutes from "./routes/adminRoutes";
import creditTierRoutes from "./routes/creditTierRoutes";
import customerAuthRoutes from "./routes/customerAuthRoutes";
import customerRoutes from "./routes/customerRoutes";
import instalmentPlanRoutes from "./routes/instalmentPlanRoutes";
import issueRoutes from "./routes/issueRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import voucherRoutes from "./routes/voucherRoutes";

const app = express();

// Middleware setup
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));

dotenv.config(); // Load environment variables

// Routes
app.use("/adminAuth", adminAuthRoutes);
app.use("/admin", adminRoutes);
app.use("/creditTier", creditTierRoutes);
app.use("/customerAuth", customerAuthRoutes);
app.use("/customer", customerRoutes);
app.use("/instalmentPlan", instalmentPlanRoutes);
app.use("/issue", issueRoutes);
app.use("/merchant", merchantRoutes);
app.use("/transaction", transactionRoutes);
app.use("/voucher", voucherRoutes);

// Dummy route for the root
app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend server is running!" });
});

export default app;
