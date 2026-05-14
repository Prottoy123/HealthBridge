import { User } from "../models/User.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";

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
    { $set: updateData }, // $set দিয়ে পুরো অবজেক্ট পাস করা হলো
    { new: true, runValidators: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", updatedProfile));
});

export const getDailySchedule = asyncHandler(async (req, res) => {
  // Set time boundaries for "today" based on server time
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const pipeline = [
    // Filter today's active appointments for the logged-in doctor
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(req.user._id),
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $ne: "CANCELLED" },
      },
    },

    // 3. Get basic user info (name, email) from "users" collection
    {
      $lookup: {
        from: "users",
        localField: "patientId", // Fixed case-sensitivity (was PatientId)
        foreignField: "_id",
        as: "patientBasicInfo",
      },
    },
    {
      $unwind: "$patientBasicInfo",
    },

    // Get medical info (DOB, bloodGroup) from "patientprofiles" collection
    {
      $lookup: {
        from: "patientprofiles", // Must match your exact DB collection name
        localField: "patientId",
        foreignField: "userId",
        as: "patientMedicalData",
      },
    },
    {
      $unwind: {
        path: "$patientMedicalData",
        preserveNullAndEmptyArrays: true, // Prevents pipeline crash if profile doesn't exist
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

    {
      $project: {
        _id: 1,
        appointmentDate: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        aiSymptomSummary: 1,

        // Grouping patient details into a clean, structured object
        patientDetails: {
          name: "$patientBasicInfo.fullName", // Taking from 1st lookup
          age: "$calculatedAge",
          bloodGroup: "$patientMedicalData.bloodGroup",
          allergies: "$patientMedicalData.allergies",
          chronicDiseases: "$patientMedicalData.chronicDiseases",
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
      new ApiResponse(200, "Daily schedule fetched successfully", dailySchedule)
    );
});
export const completeVisit = asyncHandler(async(req,res)=>{
  
})
