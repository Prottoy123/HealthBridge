import { User } from "../models/User.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Prescription } from "../models/prescription.models.js";

const uploadPrescription = asyncHandler(async (req, res) => {
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
