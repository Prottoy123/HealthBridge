import { Router } from "express";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import {
  completeVisit,
  getDailySchedule,
  getDoctorProfile,
  updateDoctorProfile,
  getAppointmentDetails,
  getActiveFollowups,
} from "../controller/doctor.controller.js";

const router = Router();

router.use(verifyJWT);

// Doctor specific routes - Restricted to "DOCTOR" role only
router.route("/daily-schedule").get(restrictTo("DOCTOR"), getDailySchedule);

router
  .route("/complete-visit/:appointmentId")
  .patch(restrictTo("DOCTOR"), completeVisit);

router
  .route("/appointment-details/:appointmentId")
  .get(restrictTo("DOCTOR"), getAppointmentDetails);

  router
    .route("/active-followups")
    .get(verifyJWT, restrictTo(["DOCTOR"]), getActiveFollowups);

router
.route("/get-profile").get(restrictTo("DOCTOR"), getDoctorProfile);

router
  .route("/update-profile")
  .patch(restrictTo("DOCTOR"), updateDoctorProfile);

export default router;
