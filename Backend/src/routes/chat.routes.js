import { Router } from "express";
import { getChatHistory } from "../controller/chat.controller.js";
import { verifyJWT } from "../middleware/userAuth.middleware.js";

const router = Router();

router.use(verifyJWT);

// GET /api/v1/chat/history/:appointmentId
router.route("/history/:appointmentId").get(getChatHistory);

export default router;
