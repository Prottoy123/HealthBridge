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
