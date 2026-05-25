import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";
import { FollowUp } from "../models/followUp.models.js";

export const generateSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.body;

  if (!doctorId || !date) {
    throw new ApiError(400, "DoctorId and date are required");
  }

  const doctorData = await DoctorProfile.findOne({
    userId: doctorId,
  });

  const appointmentCheck = await Appointment.find({
    doctorId,
    appointmentDate: date,
  });

  if (appointmentCheck.length > 0) {
    throw new ApiError(
      400,
      "Appointments already exist for this doctor on the specified date"
    );
  }

  // Taking Data from the DcotroProfile
  const { shiftStartTime, shiftEndTime, slotDuration } = doctorData;

  //  convert the start time into minutes
  const startParts = shiftStartTime.split(":"); // ["17", "30"]
  let currentMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

  //  convert the end time into minutes
  const endParts = shiftEndTime.split(":"); // ["21", "00"]
  const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

  let slotsToInsert = [];

  //  step 3: loop through the shift time to generate slots
  while (currentMinutes + slotDuration <= endMinutes) {
    //  convert current minutes to "HH:mm" format (e.g., 1050 -> "17:30")
    const startHour = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
    const startMin = String(currentMinutes % 60).padStart(2, "0");
    const slotStartTime = `${startHour}:${startMin}`;

    const nextMinutes = currentMinutes + slotDuration;

    //  convert next minutes to "HH:mm" format (e.g., 1110 -> "18:30")
    const endHour = String(Math.floor(nextMinutes / 60)).padStart(2, "0");
    const endMin = String(nextMinutes % 60).padStart(2, "0");
    const slotEndTime = `${endHour}:${endMin}`;

    slotsToInsert.push({
      doctorId: doctorId,
      appointmentDate: date,
      startTime: slotStartTime,
      endTime: slotEndTime,
      status: "PENDING",
    });

    currentMinutes = nextMinutes;
  }

  const generateSlots = await Appointment.insertMany(slotsToInsert);

  if (!generateSlots || generateSlots.length === 0) {
    throw new ApiError(500, "Failed to generate slots");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, generateSlots, "Slots generated successfully"));
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
        aiSymptomSummary: 0, 
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, queue, "Doctor queue fetched successfully"));
});

export const uploadPatientReport = asyncHandler(async (req, res) => {

  const { patientId } = req.body

  if (!patientId) {
    throw new ApiError(401,"Patient Id Required")
  }

   if (!req.files || req.files.length === 0) {
     throw new ApiError(400, "No medical records uploaded");
   }

   const filesPath = req.files.map((file)=>file.path)

   const uploadPromises = filesPath.map((path)=>uploadOnCloudinary(path))

   const resolvePromises = await Promise.all(uploadPromises)

     const successfulUploads = resolvePromises.filter((file) => file !== null);

     if (successfulUploads.length === 0) {
       throw new ApiError(500, "Failed to upload files to cloud server");
     }

      const medicalRecordsData = successfulUploads.map((file) => {
        return {
          patientId: patientId,
          fileUrl: file.url,
          recordType: 'LAB_REPORT',
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

})
