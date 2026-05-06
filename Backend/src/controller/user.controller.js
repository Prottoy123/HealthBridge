import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/PatientProfile.models.js";
import { DoctorProfile } from "../models/DoctorProfile.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";


//generate tokens
const generateAccessAndRefreshTokens = async(userId)=>{
try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    
} catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
} }

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

//userlogin
export const userLogin = asyncHandler(async (req, res) => {
    const {email,password} = req.body

    if (!email || !password) {
        throw new ApiError(201,"Credentials Required")
    }

    const user = await findOne({
    $or:[
        {email},{password}]
    })

    if (!user) {
        throw new ApiError(200,"user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(200,"password Doesnt match")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

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
export const userLogout = asyncHandler (async(req,res)=>{

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        refreshToken: undefined,
      },
    },{
        new:true,
    });

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





