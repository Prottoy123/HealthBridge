import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/patientProfile.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";
import { MedicalRecord } from "../models/medicalRecord.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { getRedis } from "../config/redis.config.js";
import { analyzeSymptomService } from "../services/analyzeSymptomService.js";
import mongoose from "mongoose";

export const getPatientProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await PatientProfile.findOne({ userId }).populate(
    "userId",
    "fullName email username"
  );

  if (!profile) {
    throw new ApiError(
      404,
      "Patient profile not found. Please complete your profile setup."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, profile, "Patient profile fetched successfully")
    );
});

export const updatePatientProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "dateOfBirth",
    "bloodGroup",
    "allergies",
    "chronicDiseases",
    "emergencyContact",
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one valid field is required to update");
  }

  const updatedProfile = await PatientProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Patient profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile Updated Successfully"));
});

export const uploadMedicalRecord = asyncHandler(async (req, res) => {
  // Check if files are uploaded
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No medical records uploaded");
  }

  const { recordType, description } = req.body;

  if (!recordType) {
    throw new ApiError(400, "Record type is required");
  }

  // upload the all file path from the multer using map method
  const filePaths = req.files.map((file) => file.path);

  //upload it on the cloudinary
  const uploadPromises = filePaths.map((path) => uploadOnCloudinary(path));

  //resolve the uploads using promise
  const uploadedFiles = await Promise.all(uploadPromises);

  const successfulUploads = uploadedFiles.filter((file) => file !== null);

  if (successfulUploads.length === 0) {
    throw new ApiError(500, "Failed to upload files to cloud server");
  }

  //creating an object for each file to save in the database
  const medicalRecordsData = successfulUploads.map((file) => {
    return {
      patientId: req.user._id,
      fileUrl: file.url,
      recordType,
      description,
      uploadedBy: req.user._id,
      uploaderRole: req.user.role,
    };
  });

  //Database operations to save all the files in once
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

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!doctorId || !date) {
    throw new ApiError(400, "DoctorId and Date are required");
  }

  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  if (date < todayString) {
    throw new ApiError(400, "Invalid date. Cannot book slots for past dates.");
  }

  const slots = await Appointment.find({
    doctorId: doctorId,
    appointmentDate: date,
    status: "PENDING",
  }).sort({ startTime: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, slots, "Slots found successfully"));
});

export const bookAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  // STEP 1: Extract the exact field name defined in your Mongoose Schema
  const { aiSymptomSummary } = req.body;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }

  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  // Prevent user from holding multiple active bookings at once (ignoring past uncompleted ones)
  const existingBooking = await Appointment.findOne({
    patientId: req.user._id,
    status: { $in: ["CONFIRMED", "CHECKED-IN", "IN-PROGRESS"] },
    appointmentDate: { $gte: todayString }
  });

  if (existingBooking) {
    throw new ApiError(
      400,
      "You already have an active appointment. Please complete or cancel it before booking a new one."
    );
  }

  const redisClient = getRedis();

  const cacheKey = "lock:slot:" + appointmentId;

  const lock = await redisClient.set(cacheKey, "locked", "EX", 60, "NX");

  if (!lock) {
    throw new ApiError(
      409,
      "Slot is already being booked by another user. Please try again."
    );
  }

  // STEP 2: Database Update Logic
  try {
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        status: "PENDING",
      },
      {
        $set: {
          status: "CONFIRMED",
          patientId: req.user._id,
          // If the frontend sends aiSymptomSummary, it will be mapped exactly to my schema field
          ...(aiSymptomSummary && { aiSymptomSummary }),
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!appointment) {
      throw new ApiError(400, "Slot is already booked or unavailable.");
    }

    // STEP 3: Emit the real-time notification to the staff
    const io = req.app.get("io");
    io.to("staff_desk").emit("queue_update", appointment);

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment booked successfully")
      );
  } finally {
    await redisClient.del(cacheKey);
  }
});

export const cancelAppoinment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }

  const filter = {
    _id: appointmentId,
    patientId: req.user?._id,
    status: "CONFIRMED",
  };

  const update = {
    $set: {
      status: "PENDING",
    },
    $unset: {
      patientId: 1,
    },
  };

  const cancel = await Appointment.findOneAndUpdate(filter, update, {
    returnDocument: "after",
  });

  if (!cancel) {
    throw new ApiError(400, "Failed to cancel appointment.");
  }

  //Emit the real time notification to the staff
  const io = req.app.get("io");
  // need the same room name in frontend (staff_desk)
  io.to("staff_desk").emit("queue_update", cancel);

  return res
    .status(200)
    .json(new ApiResponse(200, cancel, "Appointment cancelled successfully"));
});

export const getDoctorList = asyncHandler(async (req, res) => {
  const redisClient = getRedis();
  const { page = 1, limit = 10, specialization, search } = req.query;
  const cacheKey = `cache:doctors:page_${page}:limit_${limit}:spec_${specialization}:search_${search}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    const payload = JSON.parse(cachedData);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          payload,
          "Doctors list fetched successfully (from cache)"
        )
      );
  }

  const pageNumber = Math.max(1, parseInt(page) || 1);
  const limitNumber = parseInt(limit) || 10;
  const skipValue = (pageNumber - 1) * limitNumber;

  const pipeline = [
    {
      $match: {
        isVerified: true,
        ...(specialization && { specialization }),
      },
    },
    //second stage - joining the user models fields in this table.
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "User_details",
      },
    },
    //Third Stage - to convert array into object
    {
      $unwind: "$User_details",
    },
    // Fourth Stage - Deep Filtering with Regex
    {
      $match: {
        ...(search && {
          "User_details.fullName": {
            $regex: search,
            $options: "i",
          },
        }),
      },
    },
    //5th - showing all the details
    {
      $project: {
        qualifications: 1,
        experienceYears: 1,
        consultationFee: 1,
        bmdcRegistration: 1,
        "User_details.fullName": 1,
        "User_details.profileImage": 1,
      },
    },
    // Final Stage - The Parallel Engine
    {
      $facet: {
        doctorsList: [{ $skip: skipValue }, { $limit: limitNumber }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const list = await DoctorProfile.aggregate(pipeline);
  const doctors = list[0]?.doctorsList || [];
  const totalDocs = list[0]?.totalCount[0]?.total || 0;
  const totalPages = Math.ceil(totalDocs / limitNumber);

  const payload = {
    doctors,
    pagination: {
      totalDocs,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    },
  };

  const payloadString = JSON.stringify(payload);
  await redisClient.set(cacheKey, payloadString, "EX", 300);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Doctors list fetched successfully"));
});

export const getDoctorDetailsForPatient = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!doctorId) {
    throw new ApiError(400, "Doctor ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError(400, "Invalid Doctor ID format");
  }

  const profile = await DoctorProfile.findOne({ userId: doctorId })
    .populate("userId", "fullName profileImage")
    .select("-slotDuration -roomNumber -createdAt -updatedAt -__v");

  if (!profile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Doctor details fetched successfully"));
});

export const analyzeSymptom = asyncHandler(async (req, res) => {
  const { symptoms } = req.body;

  const aiResult = await analyzeSymptomService(symptoms);

  return res
    .status(200)
    .json(new ApiResponse(200, aiResult, "Symptoms analyzed successfully"));
});

export const getAppointmentHistory = asyncHandler(async (req, res) => {
  const appointmentHistory = await Appointment.aggregate([
    {
      // Match all appointments for the logged-in patient
      $match: {
        patientId: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      // Sort by newest first
      $sort: { appointmentDate: -1 },
    },
    {
      // LOOKUP 1: Fetch the FollowUp data for each appointment
      $lookup: {
        from: "followups", // Ensure this matches your exact collection name in MongoDB
        localField: "_id",
        foreignField: "originalAppointmentId",
        as: "followUpData",
      },
    },
    {
      // LOOKUP 2: Fetch Doctor's User details (Name, Image)
      $lookup: {
        from: "users",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    {
      $addFields: {
        // Since lookup returns an array, extract the first element
        followUp: { $arrayElemAt: ["$followUpData", 0] },
        doctor: {
          $let: {
            vars: { doc: { $arrayElemAt: ["$doctorInfo", 0] } },
            in: {
              _id: "$$doc._id",
              fullName: "$$doc.fullName",
              profileImage: "$$doc.profileImage",
            },
          },
        },
      },
    },
    {
      // Project only necessary fields (Zero Over-fetching)
      $project: {
        appointmentDate: 1,
        startTime: 1,
        status: 1,
        doctor: 1,
        "followUp._id": 1,
        "followUp.status": 1, // To check if "ACTIVE" or "CLOSED"
        "followUp.expiresAt": 1, // To show countdown timer in UI
      },
    },
  ]);

  if (!appointmentHistory.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No appointment history found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointmentHistory,
        "Appointment history fetched successfully"
      )
    );
});
