import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/PatientProfile.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const updatePatientProfile = asyncHandler(async(req,res)=>{

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