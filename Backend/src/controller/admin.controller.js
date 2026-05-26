import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { DoctorProfile } from "../models/doctorProfile.models.js";


export const getPendingDoctors = asyncHandler(async (req, res) => {

    const {limit=10,page=1} = req.query;

const limitNumber = parseInt(limit, 10) || 10;
const pageNumber = Math.max(1, parseInt(page, 10) || 1);

    const pipeline = [
      //1st stage
      {
        $match: {
          isVerified: false,
        },
      },

      //2nd Stage
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "User_details",
        },
      },

      //3rd stage
      {
        $unwind: "$User_details",
      },
      //4th Stage
      {
        $project: {
          specialization: 1,
          qualifications: 1,
          experienceYears: 1,
          "User_details.fullName": 1,
          "User_details.email": 1,
        },
      },
    ];

    const aggregateQuery = DoctorProfile.aggregate(pipeline);
        const getList = await DoctorProfile.aggregatePaginate(aggregateQuery, {
          page: pageNumber,
          limit: limitNumber,
        });
    
        if (!getList) {
          throw new ApiError(500, "Failed to fetch pending doctors list");
        }
    
        const payload = {
          records: getList.docs,
          pagination: {
            totalDocs: getList.totalDocs,
            totalPages: getList.totalPages,
            currentPage: getList.page,
            hasNextPage: getList.hasNextPage,
            hasPrevPage: getList.hasPrevPage,
          },
        };

        return res
        .status(200)
        .json(new ApiResponse(200,payload,"List getting Successfully"))


})