import { User } from "../models/User.models.js";
import { PatientProfile } from "../models/PatientProfile.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appoinment.models.js";
import { MedicalRecord } from "../models/medicalRecord.models.js";
import mongoose from "mongoose";

export const getPatientOwnRecords = asyncHandler(async(req,res)=>{
    const { page=1,limit=10,} = req.query

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skipValue = (pageNumber- 1) * limitNumber

    const pipeline = [
      {
        $match: {
            //to convert the string id into object for matching in the db
          patientId: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },

      //3rd stage
      {
        $facet: {
          recordList: [{ $skip: skipValue }, { $limit: limitNumber }],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

      const list = await MedicalRecord.aggregate(pipeline);

      const records = list[0]?.recordList || [];
      const totalDocs = list[0]?.totalCount[0]?.total || 0;

      const totalPages = Math.ceil(totalDocs / limitNumber);

      const payload = {
        records,
        pagination: {
          totalDocs,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
        },
      };

      return res
      .status(200)
      .json(new ApiResponse(200,payload,"Patien Records successfully found "))
})

export const getRecordsForDoctor = asyncHandler(async(req, res)=>{
    const {patientId} = req.params

    if (!patientId) {
        throw new ApiError(400," Patient Id Required")
    }

    const {page=1,limit=10} = req.query
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skipValue =(pageNumber - 1 ) * limitNumber

    //to make sure that doctor can only access 30 days of patient
    const thresholdDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // convert the 30 days to miliseconds

    const Matching = await Appointment.findOne({
        //secured the route by if doctor has an appointment with the patient in last 30 days then only he can access the records
      doctorId: req.user._id,
      patientId: patientId,
      status: { $in: ["CONFIRMED", "COMPLETED"] },
      appointmentDate: { $gte: thresholdDate },
    });

    if (!Matching) {
        throw new ApiError(
          403,
          "Forbidden Error:You do not have an active or recent appointment with this patient to view their records."
        );
    }

    const pipeline = [
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $facet:{
            recordList: [{ $skip: skipValue }, { $limit: limitNumber }],
            totalCount: [{ $count: "total" }]
        }
      }

    ];

          const List = await MedicalRecord.aggregate(pipeline);

          const records = List[0]?.recordList || [];
          const totalDocs = List[0]?.totalCount[0]?.total || 0;
          const totalPages = Math.ceil(totalDocs / limitNumber);

          const payload = {
            records,
            pagination: {
              totalDocs,
              totalPages,
              currentPage: pageNumber,
              limit: limitNumber,
            },
          };

          return res
            .status(200)
            .json(new ApiResponse(200, payload, "Records successfully found"));
})