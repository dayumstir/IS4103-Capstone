// app/backend/src/routes/ratingRoutes.ts
import { Router } from "express";
import { 
    createRating, 
    getRatings, 
    getRating,
} from "../controllers/ratingController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/add", authMiddleware, createRating);
router.post("/list", authMiddleware, getRatings);
router.get("/:rating_id", authMiddleware, getRating);

export default router;
