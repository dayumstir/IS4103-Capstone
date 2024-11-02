// src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

// Import routes
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRoutes from "./routes/adminRoutes";
import cashBackWalletRoutes from "./routes/cashbackWalletRoutes";
import creditTierRoutes from "./routes/creditTierRoutes";
import customerAuthRoutes from "./routes/customerAuthRoutes";
import customerRoutes from "./routes/customerRoutes";
import instalmentPlanRoutes from "./routes/instalmentPlanRoutes";
import issueRoutes from "./routes/issueRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import voucherRoutes from "./routes/voucherRoutes";
import instalmentPaymentRoutes from "./routes/instalmentPaymentRoutes";
import withdrawalFeeRateRoutes from "./routes/withdrawalFeeRateRoutes";

// Import error handler middleware
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import { handleStripeWebhook } from "./controllers/webhookController"; 

// Load environment variables at the start
dotenv.config();

const app = express();

// Middleware setup
app.use(cors());

app.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json()); // Built-in body-parser in Express
app.use(express.urlencoded({ extended: true }));

// Use morgan for HTTP request logging, and integrate with winston logger
app.use(
    morgan("dev", {
        stream: {
            write: (message) => logger.http(message.trim()), // Use logger for HTTP logging
        },
    })
);

// Route setup
app.use("/adminAuth", adminAuthRoutes);
app.use("/admin", adminRoutes);
app.use("/cashbackWallet", cashBackWalletRoutes);
app.use("/creditTier", creditTierRoutes);
app.use("/customerAuth", customerAuthRoutes);
app.use("/customer", customerRoutes);
app.use("/instalmentPlan", instalmentPlanRoutes);
app.use("/issue", issueRoutes);
app.use("/merchant", merchantRoutes);
app.use("/payment", paymentRoutes);
app.use("/transaction", transactionRoutes);
app.use("/voucher", voucherRoutes);
app.use("/instalment-payment", instalmentPaymentRoutes);
app.use("/withdrawalFeeRate", withdrawalFeeRateRoutes);

// Health check or root route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend server is running!" });
    logger.info("Health check route accessed");
});

// Error handling middleware
app.use(errorHandler);

export default app;
