import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";
import { FollowUp } from "../models/followUp.models.js";
import { User } from "../models/User.models.js";
import { MedicalRecord } from "../models/medicalRecord.models.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const timeToMinutes = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const generateSlots = asyncHandler(async (req, res) => {
  const { doctorId, date, startTime, endTime, duration } = req.body;

  if (!doctorId || !date) {
    throw new ApiError(400, "Doctor ID and date are mandatory fields");
  }

  const doctorData = await DoctorProfile.findById(doctorId);

  if (!doctorData) {
    throw new ApiError(404, "Doctor profile not found in the system");
  }

  const appointmentCheck = await Appointment.find({
    doctorId,
    appointmentDate: date,
  });

  if (appointmentCheck.length > 0) {
    throw new ApiError(
      409,
      "Slots have already been generated for this doctor on the specified date"
    );
  }

  const finalStartTime = startTime || doctorData.shiftStartTime;
  const finalEndTime = endTime || doctorData.shiftEndTime;
  const slotDuration = parseInt(duration || doctorData.slotDuration, 10);

  if (!finalStartTime || !finalEndTime || !slotDuration) {
    throw new ApiError(
      400,
      "Invalid shift timing configuration in Doctor Profile"
    );
  }

  let currentMinutes = timeToMinutes(finalStartTime);
  const endMinutes = timeToMinutes(finalEndTime);
  const slotsToInsert = [];

  while (currentMinutes + slotDuration <= endMinutes) {
    const nextMinutes = currentMinutes + slotDuration;

    slotsToInsert.push({
      doctorId: doctorId,
      appointmentDate: date,
      startTime: minutesToTime(currentMinutes),
      endTime: minutesToTime(nextMinutes),
      status: "PENDING",
    });

    currentMinutes = nextMinutes;
  }

  const generatedSlots = await Appointment.insertMany(slotsToInsert);

  if (!generatedSlots || generatedSlots.length === 0) {
    throw new ApiError(
      500,
      "Database transaction failed while generating slots"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { totalSlots: generatedSlots.length, slots: generatedSlots },
        "Slots successfully engineered and deployed"
      )
    );
});

export const updateQueueStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const validStatuses = ["CHECKED-IN", "IN-PROGRESS", "COMPLETED", "CANCELLED"];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const checkAppointment = await Appointment.findOneAndUpdate(
    { _id: appointmentId },
    {
      $set: { status: status },
    },
    { new: true }
  );

  if (!checkAppointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const io = req.app.get("io");

  // need the same room name in frontend (staff_desk)
  io.to("staff_desk").emit("queue_update", checkAppointment);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        checkAppointment,
        "Queue status updated successfully"
      )
    );
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  let { date } = req.query;

  if (!doctorId) {
    throw new ApiError(400, "Doctor ID is required to fetch the queue");
  }

  if (!date) {
    const today = new Date();
    date = today.toISOString().split("T")[0];
  }

  const queue = await Appointment.aggregate([
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
        appointmentDate: new Date(date),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "patientId",
        foreignField: "_id",
        as: "patientInfo",
      },
    },

    {
      $unwind: {
        path: "$patientInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        startTime: 1,
      },
    },
    {
      $project: {
        _id: 1,
        appointmentDate: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        "patientInfo._id": 1,
        "patientInfo.fullName": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, queue, "Doctor queue fetched successfully"));
});


export const searchPatientsForStaff = asyncHandler(async (req, res) => {
  const { query } = req.query; //

  if (!query) return res.status(200).json(new ApiResponse(200, [], "Empty query"));

  const patients = await User.find({
    role: "PATIENT",
    $or: [
      { fullName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ]
  })
  .select("_id fullName email phone")
  .limit(10); 

  return res.status(200).json(new ApiResponse(200, patients, "Search results"));
});

export const uploadPatientReport = asyncHandler(async (req, res) => {
  const { patientId } = req.body;

  if (!patientId) {
    throw new ApiError(401, "Patient Id Required");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No medical records uploaded");
  }

  const filesPath = req.files.map((file) => file.path);

  const uploadPromises = filesPath.map((path) => uploadOnCloudinary(path));

  const resolvePromises = await Promise.all(uploadPromises);

  const successfulUploads = resolvePromises.filter((file) => file !== null);

  if (successfulUploads.length === 0) {
    throw new ApiError(500, "Failed to upload files to cloud server");
  }

  const medicalRecordsData = successfulUploads.map((file) => {
    return {
      patientId: patientId,
      fileUrl: file.url,
      recordType: "LAB_REPORT",
      uploadedBy: req.user._id,
      uploaderRole: req.user.role,
    };
  });

  try {
    const createRecords = await MedicalRecord.insertMany(medicalRecordsData);

    if (!createRecords || createRecords.length === 0) {
      throw new ApiError(500, "Failed to save medical records in database");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createRecords,
          "Medical records uploaded successfully"
        )
      );
  } catch (error) {
    if (successfulUploads && successfulUploads.length > 0) {
      const deletePromises = successfulUploads.map((file) =>
        deleteFromCloudinary(file.public_id)
      );

      await Promise.all(deletePromises);
    }

    throw new ApiError(
      500,
      error?.message ||
        "Database transaction failed. Orphaned files cleaned up successfully."
    );
  }
});
