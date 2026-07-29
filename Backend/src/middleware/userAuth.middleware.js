import jwt from 'jsonwebtoken';
import { User } from '../models/User.models.js';
import {asyncHandler} from '../utils/AsyncHandler.js';
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        // Handle case where token is a string "null" or "undefined" from frontend
        if (!token || token === "null" || token === "undefined") {
            throw new ApiError(401, "Unauthorized request: Token missing");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
}); 