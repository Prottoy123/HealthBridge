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
