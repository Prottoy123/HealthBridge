import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import {
  createStaff,
  getPendingDoctors,
  getSystemAnalytics,
  getSystemUsers,
  updateUserStatus,
  verifyDoctor,
} from "../controller/admin.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(restrictTo("ADMIN"));

router.route("/analytics").get(getSystemAnalytics);

router.route("/pending-doctors").get(getPendingDoctors);

router.route("/verify-doctor/:doctorId").patch(verifyDoctor);

router.route("/get-user").get(getSystemUsers);

router.route("/user-status/:userId").patch(updateUserStatus);

router.route("/create-staff").post(createStaff);

export default router;
