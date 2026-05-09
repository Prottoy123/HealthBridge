import { Router } from "express";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import { getPatientOwnRecords, getRecordsForDoctor } from "../controller/medicalRecord.controller.js";
import { getDoctorList } from "../controller/patient.controller.js";

const router = Router();

router
  .route("/my-records")
  .get(verifyJWT, restrictTo(["PATIENT"]),getPatientOwnRecords );

// Security Gate: Validates 30-day active treatment window inside controller
router
  .route("/patient/:patientId")
  .get(verifyJWT, restrictTo(["DOCTOR"]),getRecordsForDoctor );

export default router;
