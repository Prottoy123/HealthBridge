import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/PatientProfile.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";

export const updatePatientProfile = asyncHandler(async (req, res) => {
  const {
    dateOfBirth,
    bloodGroup,
    allergies,
    chronicDiseases,
    emergencyContact,
  } = req.body;

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
    },
    {
      new: true,
    }
  );

  if (!UpdateProfile) {
    throw new ApiError(404, "something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile Updated", UpdateProfile));
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

export const bookAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      status: "PENDING",
    },
    {
      $set: {
        status: "CONFIRMED",
        patientId: req.user._id,
      },
    },{
      new:true,
    }
  );

  if (!appointment) {
    throw new ApiError(400, "Slot is already booked or unavailable.");
  }

  //Emit the real time notification to the staff
  const io = req.app.get("io");

  // need the same room name in frontend (staff_desk)
  io.to("staff_desk").emit("queue_update", appointment); // নির্দিষ্ট রুমে ডেটা ব্রডকাস্ট করা

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment booked successfully")
    );
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
    new: true,
  });

  if (!cancel) {
    throw new ApiError(400, "Failed to cancel appointment.");
  }

  //Emit the real time notification to the staff
  const io = req.app.get("io");
  // need the same room name in frontend (staff_desk)
  io.to("staff_desk").emit("queue_update", cancel); // নির্দিষ্ট রুমে ডেটা ব্রডকাস্ট করা

return res
    .status(200)
    .json(
      new ApiResponse(200, cancel, "Appointment cancelled successfully")
    );

})

export const getDoctorList = asyncHandler(async(req,res)=>{

  const {page=1,
    limit=10,
      specialization,
      search,
  } = req.query

  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)

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
          "User_details.name": {
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
        "User_details.name": 1,
        "User_details.profileImage": 1,
      },
    },

    // Final Stage - The Parallel Engine
    {
      $facet: {
        // doctorlist with pagination 
        doctorsList: [
          { $skip: skipValue },
           { $limit: limitNumber }
          ],

        // total doctor count seperately
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const list = await DoctorProfile.aggregate(pipeline);

  const doctors = list[0]?.doctorsList || [];
  const totalDocs = list[0]?.totalCount[0]?.total || 0;

  // pagination math
  const totalPages = Math.ceil(totalDocs / limitNumber);

  // for frontend payload delivery
  const payload = {
    doctors,
    pagination: {
      totalDocs,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Doctors list fetched successfully"));
});



