import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/PatientProfile.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";

export const updatePatientProfile = asyncHandler(async(req,res)=>{

    const {dateOfBirth,bloodGroup,allergies,chronicDiseases,emergencyContact} = req.body 

    //to check any empty field is there or not in the object
    if (Object.keys(req.body).length === 0) {
      throw new ApiError(400, "At least one field is required to update");
    }

    const UpdateProfile = await PatientProfile.findOneAndUpdate(
      {
        userId: req.user._id,
      },
      {
        $set: {
          dateOfBirth,
          bloodGroup,
          allergies,
          chronicDiseases,
          emergencyContact,
        },
      },{
        new:true
      }
    );

    if (!UpdateProfile) {
        throw new ApiError(404,"something went wrong")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Profile Updated", UpdateProfile));

})

export const pastMedicalRecord = asyncHandler(async (req, res) => {

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
  const createRecords = await MedicalRecord.insertMany(medicalRecordsData);

  if (!createRecords || createRecords.length === 0) {
    throw new ApiError(500, "Failed to save medical records in database");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Medical records uploaded successfully",
        createRecords
      )
    );
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    throw new ApiError(400, "DoctorId and Date are required");
  }

  const targetDate = new Date(date);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (targetDate < today) {
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

export const bookAppointment = asyncHandler(async(req,res)=>{



  
})



