// Conbines all routes into a single export for easy inclusion in `app.ts`
import customerAuthRoutes from "./customerAuthRoutes";
import customerRoutes from "./customerRoutes";

export default {
    customerAuthRoutes,
    customerRoutes,
};