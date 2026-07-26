import { Router } from "express";
import {
  getChatHistory,
  getPatientFollowups,
} from "../controller/chat.controller.js";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";


const router = Router();

router.use(verifyJWT);

// GET /api/v1/chat/history/:appointmentId
router.route("/history/:appointmentId").get(getChatHistory);

router
  .route("/patient-followups")
  .get(restrictTo(["PATIENT"]), getPatientFollowups);

export default router;
