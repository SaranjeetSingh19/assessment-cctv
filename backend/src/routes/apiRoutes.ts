import express from "express";
import { seedDatabase } from "../controllers/seedController";
import { ingestEvent, getMetrics } from "../controllers/eventController";

const router = express.Router();

router.post("/seed", seedDatabase);

router.post("/events", ingestEvent);
router.get("/metrics", getMetrics);

export default router;