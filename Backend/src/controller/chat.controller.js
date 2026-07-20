import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Message } from "../models/message.models.js";
import { FollowUp } from "../models/followUp.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js"; 

export const getChatHistory = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }

  const { page = 1, limit = 20 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // 1. Fetch FollowUp and populate original appointment IDs
  const appointmentData = await FollowUp.findOne({
    originalAppointmentId: appointmentId,
  }).populate({
    path: "originalAppointmentId",
    select: "patientId doctorId",
  });

  if (!appointmentData) {
    throw new ApiError(404, "Appointment not found");
  }

  const appointmentInfo = appointmentData.originalAppointmentId;

  // 2. THE IDENTITY BRIDGE: Bulletproof Authorization Logic
  let isAuthorized = false;

  // Check 1: Is the user the Patient? (Patient ID is directly the User ID)
  if (appointmentInfo.patientId.toString() === req.user._id.toString()) {
    isAuthorized = true;
  }

  // Check 2: Is the user the Doctor? (Need to map User ID -> DoctorProfile ID)
  if (!isAuthorized && req.user.role === "DOCTOR") {
    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });

    if (!doctorProfile) {
      throw new ApiError(404, "Doctor profile not found for this account");
    }

    if (appointmentInfo.doctorId.toString() === doctorProfile._id.toString()) {
      isAuthorized = true;
    }
  }

  // Final Guard Clause
  if (!isAuthorized) {
    throw new ApiError(403, "You are not a participant in this conversation");
  }

  // 3. Fetching Messages & Pagination Meta (Parallel Execution)
  const [messages, totalMessages] = await Promise.all([
    Message.find({ originalAppointmentId: appointmentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Message.countDocuments({ originalAppointmentId: appointmentId }),
  ]);

  const totalPages = Math.ceil(totalMessages / limitNumber);

  // 4. Returning Structured Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        pagination: {
          totalMessages,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
        },
      },
      "Chat history fetched successfully"
    )
  );
});
