import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";
import { getRedis } from "../config/redis.config.js";
import { User } from "../models/User.models.js";
import { sendEmail } from "../utils/sendMail.js";


export const getPendingDoctors = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;

  const limitNumber = parseInt(limit, 10) || 10;
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);

  const pipeline = [
    {
      $match: {
        isVerified: false,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "User_details",
      },
    },

    {
      $unwind: "$User_details",
    },

    {
      $project: {
        specialization: 1,
        qualifications: 1,
        experienceYears: 1,
        bmdcRegistration: 1, 
        "User_details.fullName": 1,
        "User_details.email": 1,
      },
    },
  ];

  const aggregateQuery = DoctorProfile.aggregate(pipeline);
  const getList = await DoctorProfile.aggregatePaginate(aggregateQuery, {
    page: pageNumber,
    limit: limitNumber,
  });

  if (!getList) {
    throw new ApiError(500, "Failed to fetch pending doctors list");
  }

  const payload = {
    records: getList.docs,
    pagination: {
      totalDocs: getList.totalDocs,
      totalPages: getList.totalPages,
      currentPage: getList.page,
      hasNextPage: getList.hasNextPage,
      hasPrevPage: getList.hasPrevPage,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "List getting Successfully"));
});

export const verifyDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!doctorId) {
    throw new ApiError(400, "Doctor ID is required");
  }

  const doctor = await DoctorProfile.findById(doctorId).populate(
    "userId",
    "email status"
  );

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  if (doctor.isVerified) {
    throw new ApiError(400, "Doctor is already verified");
  }

  doctor.isVerified = true;
  await doctor.save();

  const updatedUser = await User.findByIdAndUpdate(
    doctor.userId._id,
    { $set: { status: "ACTIVE" } },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(500, "Failed to update the user status to ACTIVE");
  }

  try {
    await sendEmail({
      email: doctor.userId.email,
      subject: "Verification Successful - HealthBridge",
      message:
        "Congratulations! Your profile has been verified by the Admin. Your account is now ACTIVE and you can start generating your slots.",
    });
  } catch (error) {
    console.error(
      "Doctor verified, but failed to send confirmation email:",
      error
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {
      doctorProfile: doctor,   
      userAccount: updatedUser 
    }, "Doctor verified successfully"));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Prevent admin from suspending their own account (Type casting matched)
  if (userId === req.user._id.toString()) {
    throw new ApiError(403, "You cannot change your own account status");
  }

  if (!status || !["ACTIVE", "BLOCKED"].includes(status)) {
    throw new ApiError(400, "Valid status is required (ACTIVE or BLOCKED)");
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    throw new ApiError(404, "User not found in the database");
  }

  // Idempotency check: Avoid unnecessary database write operation
  if (findUser.status === status) {
    throw new ApiError(400, `User is already ${status}`);
  }

  findUser.status = status;
  await findUser.save();

  // Fire and forget email notification (Non-blocking)
  sendEmail({
    email: findUser.email,
    subject: "Status Updated - HealthBridge",
    message: `Your account status has been updated to ${status}.`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, findUser, "User status updated successfully"));
});

export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const redisClient = getRedis();
  const cacheKey = "cache:admin:analytics";

  // Check if analytics data is present in Redis cache
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cachedData), "Cached analytics data retrieved successfully"));
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [totalPatients, totalDoctors, pendingApprovals, appointmentsToday] =
    await Promise.all([
      User.countDocuments({ role: "PATIENT" }),
      User.countDocuments({ role: "DOCTOR", status: "ACTIVE" }),
      DoctorProfile.countDocuments({ isVerified: false }),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),
    ]);

  const payload = {
    totalPatients,
    totalDoctors,
    pendingApprovals,
    appointmentsToday,
  };

  // Cache the analytics data in Redis with a TTL of 5 minutes (300 seconds)
  const payloadString = JSON.stringify(payload);
await redisClient.set(cacheKey, payloadString, "EX", 300);

  return res
    .status(200)
    .json(
      new ApiResponse(200, payload, "System analytics retrieved successfully")
    );
});

export const createStaff = asyncHandler(async (req, res) => {
  const { fullName, email, role } = req.body;

  if (!fullName || !email || !role) {
    throw new ApiError(400, "Full name, email, and role are required");
  }

  const assignedRole = role.toUpperCase();
  if (assignedRole !== "STAFF" && assignedRole !== "ADMIN") {
    throw new ApiError(
      403,
      "Security Violation: Only STAFF or ADMIN roles can be provisioned here"
    );
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(
      409,
      "An internal account with this email already exists"
    );
  }

  const temporaryPassword = crypto.randomBytes(4).toString("hex");

  const user = await User.create({
    fullName,
    email,
    password: temporaryPassword,
    role: assignedRole,
    status: "ACTIVE",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Internal Server Error: Failed to provision the account"
    );
  }

  const emailSubject = `Welcome to Health-Bridge - Your ${assignedRole} Account Details`;
  const emailMessage = `
Hello ${fullName},

Welcome to the Health-Bridge Team! An internal ${assignedRole} account has been securely provisioned for you by the administration.

Here are your login credentials:
Email: ${email}
Temporary Password: ${temporaryPassword}

SECURITY NOTICE: 
Please log in immediately and navigate to your Profile Settings to change this temporary password. Do not share this email with anyone.

Regards,
Health-Bridge Core System
    `;

  await sendEmail({
    email: email,
    subject: emailSubject,
    message: emailMessage,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: createdUser,
        temporaryPassword: temporaryPassword,
      },
      `${assignedRole} account provisioned and credentials dispatched via email successfully.`
    )
  );
});
