import { Router } from "express";

import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { restrictTo } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  decodePrescription,
  getMyPrescriptions,
  getPatientPrescriptions,
  uploadPrescription,
} from "../controller/prescription.controller.js";

const router = Router();

router.use(verifyJWT);

// POST /api/v1/prescriptions/upload
router
  .route("/upload")
  .post(
    restrictTo("PATIENT"),
    upload.fields([{ name: "prescriptionImage", maxCount: 1 }]),
    uploadPrescription
  );

// GET /api/v1/prescriptions/my-prescriptions
router
  .route("/my-prescriptions")
  .get(restrictTo("PATIENT"), getMyPrescriptions);

// GET /api/v1/prescriptions/patient/:patientId
router
  .route("/patient/:patientId")
  .get(restrictTo("DOCTOR"), getPatientPrescriptions);

  router
  .route("/decode")
  .post(
    verifyJWT,                  
    restrictTo(["PATIENT"]),     
    upload.single("prescription"), 
    decodePrescription           
  );

export default router;



export default router;
