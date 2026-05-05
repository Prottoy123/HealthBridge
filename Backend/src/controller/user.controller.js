import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/PatientProfile.models.js";
import { DoctorProfile } from "../models/DoctorProfile.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";

//register User
export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, password, role } = req.body;

  if (!email || !fullName || !password || !role) {
    throw new ApiError(400, "Credentials required");
  }

  const existedUser = await User.findOne({
    email,
  });

  if (existedUser) {
    throw new ApiError(409, "Already have a account");
  }

  const imageLocalpath = req.files?.profileImage?.[0]?.path;

  if (!imageLocalpath) {
    throw new ApiError(401, "Cant found the localPath");
  }

  const profileImage = await uploadOnCloudinary(imageLocalpath);

  if (!profileImage) {
    throw new ApiError(400, "Image Required");
  }

  let userStatus;

  if (req.body?.role === "PATIENT") {
    userStatus = "ACTIVE";
  } else if (req.body?.role === "DOCTOR") {
    userStatus = "PENDING";
  }

  const user = await User.create({
    fullName,
    email,
    profileImage: profileImage.url,
    password,
    role,
    status: userStatus,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("User cant be created");
  }

  if (createdUser.role === "PATIENT") {
    const userProfile = await PatientProfile.create({
      userId: user._id,
    });
  } else if (createdUser.role === "DOCTOR") {
    const doctorProfile = await DoctorProfile.create({
      userId: user._id,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});
