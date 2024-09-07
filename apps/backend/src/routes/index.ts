// Conbines all routes into a single export for easy inclusion in `app.ts`
import authRoutes from "./authRoutes";
import customerRoutes from "./customerRoutes";

export default {
    authRoutes,
    customerRoutes,
};