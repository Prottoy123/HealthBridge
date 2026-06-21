import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/userAuth.middleware.js";

import {
  registerUser,
  refreshAccessToken,
  userLogin,
  userLogout,
  changeCurrentPassword,
  updateAccountDetails,
} from "../controller/user.controller.js";

const router = Router();

// Public Routes
router
  .route("/register")
  .post(upload.fields([{ name: "profileImage", maxCount: 1 }]), registerUser);

router.route("/login").post(userLogin);
router.route("/refresh-token").post(refreshAccessToken);

// Secured Routes
router.route("/logout").post(verifyJWT, userLogout);

router.route("/change-password").patch(verifyJWT,changeCurrentPassword );
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;
