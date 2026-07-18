import mongoose from "mongoose";
import { User } from "../models/User.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";
import { FollowUp } from "../models/followUp.models.js";
import { getRedis } from "../config/redis.config.js";
export const getDoctorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await DoctorProfile.findOne({ userId }).populate(
    "userId",
    "fullName email profileImage status role"
  );

  if (!profile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Doctor profile fetched successfully"));
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
  if (req.body.isVerified !== undefined || req.body.userId !== undefined) {
    throw new ApiError(
      400,
      "You do not have permission to update restricted fields"
    );
  }

  const allowedFields = [
    "consultationFee",
    "experienceYears",
    "slotDuration",
    "shiftStartTime",
    "shiftEndTime",
    "about",
    "roomNumber",
    "specialization",
    "workingDays",
    "qualifications",
    "bmdcRegistration",
  ];

  const updateData = {};

  //dynamic to update only the fields that are present in the request body and are allowed to be updated
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  //validate to check if any valid field is provided for update or not
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid data provided to update");
  }

  if (
    updateData.slotDuration ||
    updateData.shiftStartTime ||
    updateData.shiftEndTime
  ) {
    const hasActiveAppointments = await Appointment.findOne({
      doctorId: req.user._id,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (hasActiveAppointments) {
      throw new ApiError(
        400,
        "Cannot update schedule. You have active appointments."
      );
    }
  }

  const updatedProfile = await DoctorProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile updated successfully"));
});

export const getDailySchedule = asyncHandler(async (req, res) => {
  const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  endOfDay.setHours(23, 59, 59, 999);

  const pipeline = [
    // 2. Filter today's active appointments
    {
      $match: {
        doctorId: doctorProfile._id, 
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $ne: "CANCELLED" },
      },
    },

    // 3. Get basic user info (with strict drop prevention)
    {
      $lookup: {
        from: "users",
        localField: "patientId",
        foreignField: "_id",
        as: "patientBasicInfo",
      },
    },
    {
      // THE FIX: If patientId is missing or invalid, do NOT drop the appointment
      $unwind: {
        path: "$patientBasicInfo",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Get lightweight medical profile
    {
      $lookup: {
        from: "patientprofiles",
        localField: "patientId",
        foreignField: "userId",
        as: "patientMedicalData",
      },
    },
    {
      $unwind: {
        path: "$patientMedicalData",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 5. Mathematical Engine: Calculate exact age using $dateDiff
    {
      $addFields: {
        calculatedAge: {
          $cond: {
            if: { $ifNull: ["$patientMedicalData.dateOfBirth", false] },
            then: {
              $dateDiff: {
                startDate: "$patientMedicalData.dateOfBirth",
                endDate: "$$NOW",
                unit: "year",
              },
            },
            else: "N/A",
          },
        },
      },
    },

    // 6. Maintain Queue Order
    {
      $sort: { startTime: 1 },
    },

    // 7. Strict Lightweight Projection
    {
      $project: {
        _id: 1,
        appointmentDate: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        // Added patientId to projection for debugging
        patientId: 1,
        patientDetails: {
          // If basic info is missing, fallback to "Unknown"
          name: {
            $ifNull: [
              "$patientBasicInfo.fullName",
              "Unknown Patient (ID Missing)",
            ],
          },
          age: "$calculatedAge",
          email: { $ifNull: ["$patientBasicInfo.email", "N/A"] },
          emergencyContact: {
            $ifNull: ["$patientMedicalData.emergencyContact", "N/A"],
          },
        },
      },
    },
  ];

  const dailySchedule = await Appointment.aggregate(pipeline);

  if (!dailySchedule) {
    throw new ApiError(500, "Failed to fetch daily schedule");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, dailySchedule, "Daily schedule fetched successfully")
    );
});

export const getAppointmentDetails = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }

  const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const pipeline = [
    // 1. Target the specific appointment and secure it to the logged-in doctor
    {
      $match: {
        _id: new mongoose.Types.ObjectId(appointmentId),
        doctorId: doctorProfile._id,
      },
    },

    // 2. First Join: Get patient identity from "users" collection
    {
      $lookup: {
        from: "users",
        localField: "patientId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },

    // 3. Second Join: Get clinical profile from "patientprofiles" collection
    {
      $lookup: {
        from: "patientprofiles",
        localField: "patientId",
        foreignField: "userId",
        as: "patientProfile",
      },
    },
    {
      // CORRECTED: Fixed the syntax structure for conditional unwind
      $unwind: {
        path: "$patientProfile",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Mathematical Engine: Dynamic age calculation using unified aliases
    {
      $addFields: {
        calculatedAge: {
          $cond: {
            // CORRECTED: Swapped "patientMedicalData" with the actual alias "patientProfile"
            if: { $ifNull: ["$patientProfile.dateOfBirth", false] },
            then: {
              $dateDiff: {
                startDate: "$patientProfile.dateOfBirth",
                endDate: "$$NOW",
                unit: "year",
              },
            },
            else: "N/A",
          },
        },
      },
    },

    // 5. Deep Heavyweight Projection for Consultation Workspace
    {
      $project: {
        _id: 1,
        status: 1,
        aiSymptomSummary: 1, // Exposed Gemini AI summary for the doctor

        // Packing all compiled patient demographics & medical data
        patientDetails: {
          name: "$userInfo.fullName", // CORRECTED: Matched to userInfo alias
          email: "$userInfo.email",
          age: "$calculatedAge",
          emergencyContact: {
            $ifNull: ["$patientProfile.emergencyContact", "N/A"],
          },
          // CORRECTED: Explicit paths provided for nested array fields
          bloodGroup: { $ifNull: ["$patientProfile.bloodGroup", "N/A"] },
          allergies: { $ifNull: ["$patientProfile.allergies", []] }, // Safe empty array fallback
          chronicDiseases: { $ifNull: ["$patientProfile.chronicDiseases", []] },
        },
      },
    },
  ];

  const appointmentDetails = await Appointment.aggregate(pipeline);

  // If the query returns empty, it means the ID is invalid or belongs to another doctor
  if (!appointmentDetails || appointmentDetails.length === 0) {
    throw new ApiError(404, "Appointment not found or you are not authorized");
  }

  // Returning the single finalized object directly without extra payload wraps
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Appointment details fetched successfully",
        appointmentDetails[0]
      )
    );
});

export const completeVisit = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { followUpDays } = req.body;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }

  if (followUpDays === undefined || followUpDays === null) {
    throw new ApiError(400, "Follow-up days are required");
  }

  const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const redisTTl = followUpDays * 24 * 60 * 60; // Redis TTL in seconds

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const appointmentStatus = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        doctorId: doctorProfile._id,
      },
      {
        $set: {
          status: "COMPLETED",
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!appointmentStatus) {
      throw new ApiError(
        404,
        "Appointment not found or you are not authorized"
      );
    }

    const unlocksAtTime = Date.now() + followUpDays * 24 * 60 * 60 * 1000;

    const unlocksAt = new Date(unlocksAtTime);
    const expiresAt = new Date(unlocksAtTime + 48 * 60 * 60 * 1000);

    const createFollowUp = await FollowUp.create(
      [
        {
          originalAppointmentId: appointmentId,
          type: "POST_MEDICATION_CHAT",
          unlocksAt: unlocksAt,
          expiresAt: expiresAt,
        },
      ],
      { session }
    );

    if (!createFollowUp || createFollowUp.length === 0) {
      throw new ApiError(500, "Failed to create follow-up window");
    }

    await session.commitTransaction();

    try {
      const redisClient = getRedis();
      const redisKey = `chat_unlock:${appointmentId}`;
      const redisExecution = await redisClient.set(
        redisKey,
        "locked",
        "EX",
        redisTTl
      );
    } catch (err) {
      console.error("Failed to set Redis key for follow-up lock:", err);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          appointment: appointmentStatus,
          followUp: createFollowUp[0],
        },
        "Visit completed and follow-up scheduled successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});
