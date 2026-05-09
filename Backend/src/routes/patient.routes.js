import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import {
  uploadMedicalRecord,
  updatePatientProfile,
  getAvailableSlots,
  bookAppointment,
  cancelAppoinment,
  getDoctorList,
} from "../controller/patient.controller.js";

const router = Router();

// 1. Discovery Engine Routes
router
  .route("/doctors")
  .get(verifyJWT, restrictTo(["PATIENT", "STAFF"]), getDoctorList);

router
  .route("/slots/:doctorId")
  .get(verifyJWT, restrictTo(["PATIENT", "STAFF"]), getAvailableSlots);

// 2. Profile & Medical Records Routes
router
  .route("/profile")
  .patch(verifyJWT, restrictTo(["PATIENT"]), updatePatientProfile);

router
  .route("/medical-records/upload")
  .post(
    verifyJWT,
    restrictTo(["PATIENT"]),
    upload.array("recordFiles", 5),
    uploadMedicalRecord
  );

// 3. Transaction Engine (Appointment) Routes

router
  .route("/book/:appointmentId")
  .patch(verifyJWT, restrictTo(["PATIENT"]), bookAppointment);

router
  .route("/cancel/:appoinmentId")
  .patch(verifyJWT, restrictTo(["PATIENT"]), cancelAppoinment);

export default router;
