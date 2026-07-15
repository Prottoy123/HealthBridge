import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import { getAllPatientsForStaff, generateSlots, getDoctorAppointments, updateQueueStatus, uploadPatientReport } from "../controller/staff.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(restrictTo("STAFF"));

router.route("/generate-slots").post(generateSlots);

router.route("/doctor-queue").get(getDoctorAppointments);

router.route("/queue-status/:appointmentId").patch(updateQueueStatus);

router
  .route("/upload-lab-report")
  .post(upload.array("recordFiles", 5), uploadPatientReport);

  router.route("/get-patients").get(getAllPatientsForStaff);

export default router;