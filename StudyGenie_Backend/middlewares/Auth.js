import jwt from 'jsonwebtoken'
import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/User.model.js'




export const VerifyUser = AsyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accesstoken
    if(!token)
    {
        throw new ApiError(400,"NO ACCESSTOKEN FOUND!!")
    }
    try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_SECRET)
        const FindUser = await User.findById(decodedToken.id).select("-refreshtoken -password")
        if(!FindUser)
        {
            throw new ApiError(400,"NO USER FOUND!!")
        }
        req.user = FindUser
        next()
    } catch (error) {
        console.log("error: ",error)
    }
})