
//login karne pr ham accessToken or reFreshToken bhje usi k base pr verify kare gy k 
// user k pass sahi token h ya nhi usi pr login hua agr to true login h to ham 

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";
//req.body mein ak new object yani ak or req set kr dein gy
//jo cheez use na hu rhi hu _ lga lo
export const varifyJwt = asyncHandler(async (req, _, next)=>{
// token k acces lena h how to take
// we can take access of req.cookie ye aye ko loginUser se app mein or phir app se kahi
// b access hu sakta h 
 // login se to sye hn cookie lkn phir b  
 //postman se header mein Authorization: Bearer <token> ata h
  try{
    //console.log()
    const token = req.cookies?.accessToken || req.header
("Authorization")?.replace("Bearer ", "") //kali kr de ta k pichy serf token reh jaye ga 
 
if(!token){
    throw new ApiError(201, "unAuthorized request")
}

//token agr h to jwt se varify kare gy yani decode 
//token user.modle mein generateAccessToken method se jwt ko retuen kr rehy hn
// esi liye jwt se varify kr sakte hn
//token to a jayr ga lkn decode wahi kr sakta jis k pass secret key hu gi
 const decodedToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 console.log(decodedToken)
 //agr decodedToken user k id h to user k id ko req.user mein set kr dein gy
 const user =await User.findById(decodedToken?._id) 
 //_id user.modle se a rha h jo k jwt ko diya h
 .select("-password -refreshToken") //ignore

 if(!user){
    // todo : discuss about frontend
    throw new ApiError(201, "inValid Token !!!")
 }
 //agr user h to req.user ko set kr dein gy
 req.user=user
 //routes mein verifyJwt k bad kiya krna h es liye next() use kiya
 next()
  }catch(error){
    throw new ApiError(401, error?.message || "Invalid token access")
  }

})