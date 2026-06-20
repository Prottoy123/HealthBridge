import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Message } from "../models/message.models.js";
import { FollowUp } from "../models/followUp.models.js";

export const getChatHistory = asyncHandler(async()=>{
    const { appointmentId } = req.params
    if (!appointmentId) {
        throw new ApiError(401,"Cant find the id")
    }
    const {page =1,limit=20} = req.query

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

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

    const isPatient = appointmentInfo.patientId.toString() === req.user._id.toString();
    const isDoctor = appointmentInfo.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      throw new ApiError(403, "You are not a participant in this conversation");
    }

    const [messages, totalMessages] = await Promise.all([
      Message.find({ originalAppointmentId: appointmentId })
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limitNumber),
      Message.countDocuments({ originalAppointmentId: appointmentId }), 
    ]);

    const totalPages = Math.ceil(totalMessages / limitNumber);

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


})
