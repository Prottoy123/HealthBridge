import { User } from "../models/User.models.js"
import {ApiError} from '../utils/apiError.js'

// this middleware will be used in routes after the authUser....
//like this--> verifyjwt, restrictTo['doctor],controller

export const restrictTo = (allowedRoles) =>{
   return (req,res,next)=>{

    if (!allowedRoles.includes(req.user?.role)) {
        throw new ApiError(
          403,
          `Forbidden: Users with role '${req.user?.role}' do not have permission to access this route.`
        );
    }

    if (req.user?.status !== "ACTIVE") {
      throw new ApiError(
        403,
        `Access Denied: Your account status is currently ${req.user?.status}. Contact Administration.`
      );
    }
    next ();
   }
}