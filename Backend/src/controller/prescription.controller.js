import { User } from "../models/User.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Prescription } from "../models/prescription.models.js";

export const uploadPrescription = asyncHandler(async (req, res) => {
  const { title, doctorName, prescriptionDate } = req.body;

  if (!title || !doctorName || !prescriptionDate) {
    throw new ApiError(400, "All fields are required");
  }

  const imageLocalpath = req.files?.prescriptionImage?.[0]?.path;

  if (!imageLocalpath) {
    throw new ApiError(400, "Image Required");
  }
  const uploadImage = await uploadOnCloudinary(imageLocalpath);

  if (!uploadImage) {
    throw new ApiError(401, "file uploading failed");
  }

  const createPrescription = await Prescription.create({
    patientId: userLogin.req._id,
    title,
    doctorName,
    prescriptionDate,
    fileUrl: uploadImage.url,
    publicId: uploadImage.public_id,
  });

  if (!createPrescription) {
    throw new ApiError(400, "error Occured");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createPrescription,
        "Prescription uploaded successfully"
      )
    );
});

export const getMyPrescriptions = asyncHandler(async(req,res)=>{

  const {page=1,limit=10} = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const pipeline = [
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(req.user._id),
        },
      },

      {
        $sort: {
          prescriptionDate:-1
        },
      },
    ];

    const aggregateQuery = Prescription.aggregate(pipeline);
    const prescriptions = await Prescription.aggregatePaginate(aggregateQuery, {
      page: pageNumber,
      limit: limitNumber,
    });

    if (!prescriptions) {
      throw new ApiError(500, "Failed to fetch prescriptions");
    }

    const payload = {
      records: prescriptions.docs, 
      pagination: {
        totalDocs: prescriptions.totalDocs, 
        totalPages: prescriptions.totalPages, 
        currentPage: prescriptions.page, 
        hasNextPage: prescriptions.hasNextPage, 
        hasPrevPage: prescriptions.hasPrevPage,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, payload, "Prescriptions fetched successfully")
      );

})
export const getPatientPrescriptions = asyncHandler(async(req,res)=>{
 const {patientId} = req.params;
 const {page=1,limit=10} = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const thresholdDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const verifyUser = await Appointment.findOne({
    patientId: patientId,
    doctorId: req.user._id,
    status: {
      $in: ["COMPLETED", "CONFIRMED"],
    },
    appointmentDate: { $gte: thresholdDate },
  });

  if (!verifyUser) {
    throw new ApiError(403,"You dont have authority to view this")
  }

  const pipeline = [
    {
      $match: {
        patientId: new mongoose.Types.ObjectId(patientId),
      },
    },
    {
      $sort: {
        prescriptionDate: -1,
      },
    },
  ];

      const aggregateQuery = Prescription.aggregate(pipeline);
      const prescriptions = await Prescription.aggregatePaginate(aggregateQuery, {
        page: pageNumber,
        limit: limitNumber,
      });

      if (!prescriptions) {
        throw new ApiError(500, "Failed to fetch prescriptions");
      }

      const payload = {
        records: prescriptions.docs,
        pagination: {
          totalDocs: prescriptions.totalDocs,
          totalPages: prescriptions.totalPages,
          currentPage: prescriptions.page,
          hasNextPage: prescriptions.hasNextPage,
          hasPrevPage: prescriptions.hasPrevPage,
        },
      };

      return res
        .status(200)
        .json(
          new ApiResponse(200, payload, "Prescriptions fetched successfully")
        ); 
  
})
