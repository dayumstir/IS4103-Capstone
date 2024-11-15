// apps/backend/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables at the start
dotenv.config();

// Import routes
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRoutes from "./routes/adminRoutes";
import cashbackWalletRoutes from "./routes/cashbackWalletRoutes";
import creditTierRoutes from "./routes/creditTierRoutes";
import customerAuthRoutes from "./routes/customerAuthRoutes";
import customerRoutes from "./routes/customerRoutes";
import instalmentPlanRoutes from "./routes/instalmentPlanRoutes";
import instalmentPaymentRoutes from "./routes/instalmentPaymentRoutes";
import issueRoutes from "./routes/issueRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import merchantPaymentRoutes from "./routes/merchantPaymentRoutes";
import merchantSizeRoutes from "./routes/merchantSizeRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import ratingRoutes from "./routes/ratingRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import voucherRoutes from "./routes/voucherRoutes";
import withdrawalFeeRateRoutes from "./routes/withdrawalFeeRateRoutes";

// Import middleware and utilities
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import { handleStripeWebhook } from "./controllers/webhookController";

// Load environment variables at the start
dotenv.config();

const app = express();

// Stripe Webhook (raw body parser required by Stripe)
app.post(
    "/webhook/stripe",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

// ====== Middleware setup ======
app.use(cors());

// JSON and URL-encoded parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging with morgan, integrated with custom logger
app.use(
    morgan("dev", {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
    })
);

// ====== Route setup ======
app.use("/adminAuth", adminAuthRoutes);
app.use("/admin", adminRoutes);
app.use("/cashbackWallet", cashbackWalletRoutes);
app.use("/creditTier", creditTierRoutes);
app.use("/customerAuth", customerAuthRoutes);
app.use("/customer", customerRoutes);
app.use("/instalmentPlan", instalmentPlanRoutes);
app.use("/instalmentPayment", instalmentPaymentRoutes);
app.use("/issue", issueRoutes);
app.use("/merchant", merchantRoutes);
app.use("/merchantPayment", merchantPaymentRoutes);
app.use("/merchantSize", merchantSizeRoutes);
app.use("/notification", notificationRoutes);
app.use("/payment", paymentRoutes);
app.use("/rating", ratingRoutes);
app.use("/transaction", transactionRoutes);
app.use("/voucher", voucherRoutes);
app.use("/withdrawalFeeRate", withdrawalFeeRateRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend server is running!" });
  logger.info("Health check route accessed");
});

// Error handling middleware
app.use(errorHandler);

export default app;
