import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/patientProfile.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

//generate tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

//register User
export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, password, role, bmdcRegistration } = req.body;

  if (!email || !fullName || !password || !role) {
    throw new ApiError(400, "All credentials are required");
  }

  const userRole = role.toUpperCase();
  if (userRole === "ADMIN" || userRole === "STAFF") {
    throw new ApiError(
      403,
      "Security Violation: Cannot register ADMIN or STAFF accounts through this public channel"
    );
  }

  if (userRole !== "PATIENT" && userRole !== "DOCTOR") {
    throw new ApiError(
      400,
      "Invalid role. Only PATIENT or DOCTOR are allowed."
    );
  }

  if (userRole === "DOCTOR" && !bmdcRegistration) {
    throw new ApiError(400, "BMDC Registration number is required for doctors");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const imageLocalpath = req.files?.profileImage?.[0]?.path;

  if (!imageLocalpath) {
    throw new ApiError(400, "Profile image is required");
  }

  const profileImage = await uploadOnCloudinary(imageLocalpath);

  if (!profileImage) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  const userStatus = userRole === "PATIENT" ? "ACTIVE" : "PENDING"; 

  const user = await User.create({
    fullName,
    email,
    profileImage: profileImage.secure_url,
    password,
    role: userRole,
    status: userStatus,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed at database level");
  }

  if (createdUser.role === "PATIENT") {
    await PatientProfile.create({ userId: user._id });
  } else if (createdUser.role === "DOCTOR") {
    await DoctorProfile.create({ userId: user._id, bmdcRegistration });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

//userlogin
export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(201, "Credentials Required");
  }

  const user = await User.findOne({
    $or: [{ email }, { password }],
  });

  if (!user) {
    throw new ApiError(200, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Doesn't match");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully"
      )
    );
});

//user logout
export const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      returnDocument: "after",
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

//change current password
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  if (!oldPassword || !newPassword || !confPassword) {
    throw new ApiError(
      400,
      "Old password, new password, and confirm password are required"
    );
  }

  if (newPassword !== confPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

if (user.status === "PENDING" && ["STAFF", "ADMIN"].includes(user.role)) {
  user.status = "ACTIVE";
}

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: user.status },
        "Password changed successfully"
      )
    );
});

//update Account Details 
export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  if (!fullName && !phone) {
    throw new ApiError(
      400,
      "At least one field (fullName or phone) is required to update"
    );
  }

  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  ).select("-password -refreshToken"); 

  if (!updatedUser) {
    throw new ApiError(404, "User account not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

//generate silent refresh token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token: User Not Found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is invalid or compromised");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: accessToken, // Fix: সঠিক ভেরিয়েবল পাস করা হলো
            refreshToken: newRefreshToken,
          },
          "Access Token successfully refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Invalid or Expired Refresh Token"
    );
  }
});
