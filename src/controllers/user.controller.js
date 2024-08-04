import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiResponse}  from "../utils/ApiResponse.js"
import {ApiError} from  "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {cloudinaryUploadedfileMethod} from "../utils/cloudinary.js"


const registerUser= asyncHandler(async (req, res)=>{
    
    //1- get user details from frontend
    //2- validation - not empty
    //3- check if user already exists: username, email
    //!!----images k liye user.router mein multer import kare gy
    //4- check for images, check for avatar
    //5- upload them to cloudinary, avatar

    //6- create user object - create entry in db ckeck successfully
    //7- remove password and refresh token field from response
    //8- check for user creation
    //9- return resApi

      // snd to postman checking from frontenf data a rha h ya nhi
    // res.status(200).json({
    //     message: "taniya learn backend"
    // })

        
    // 1- logic form /json se data req.body se mil jaye ga
    //req.body hame express se milta h
    const {fullName, username, email, password}=req.body
    console.log("frontend se ae wala data !! ", req.body)
    console.log(email)


    //2- logic validation k user ne empty to nhi bhja
    if(
        [fullName, username, email, password].some((field)=>field?.trim() === "")
        //trim krne k baad true snd kiya mtlb khali tha
     ){
        throw new ApiError(400, "All feild must be required !!")
     }


     
      // 3- logic // check if user already exists: username, email
      const existingUser = await User.findOne({ 
        $or : [{ username }, { email }]
      });
      // if user already exists
       console.log("same username and email already exist !" , existingUser)
      if(existingUser){
        throw new ApiError(409, "Username or Email already exist !")
      }
       console.log(req.files)
      //4-logic check for images, check for avatar
      //register method se pahle multer use kiya h multer hame req.files deta h
      // req.files avatar and coverImage h
      // jesy hi submit kiya multer ne path ko apne server pr rakh liya
      //multer return path krta h jo k multer.midleware se a rha h
      
     const avatarLocalpath = req.files?.avatar[0]?.path;
     const coverImageLocalpath = req.files?.coverImage[0]?.path;
      console.log(" multer se a rahi h files ", req.files)

      if(!avatarLocalpath){
        throw new ApiError(400, "Avatar is required !!")
      }

      //5-logic upload them to cloudinary, avatar
       // image may be take time use await
       //must be check avatar it is required
       const avatar =await cloudinaryUploadedfileMethod(avatarLocalpath)
       const coverImage=await cloudinaryUploadedfileMethod(coverImageLocalpath)
 
       if(!avatar){
         throw new ApiError(400, "Avatar file is not required in cloudinary !!")
       }

    //6-logic create user object - create entry in db and check is successfully
     //database se error mil sakta h database dosra continent h error asyncHandler
     // dekh le ga
      const user=await User.create({
        fullName, 
        avatar :avatar.url,
        coverImage: coverImage?.url || "",
        email:email,
        password,
        username: username.toLowerCase(),
       })

       const userCreatedSuccessfully = await User.findById(user._id).select(
        "-password -refreshToken"
       )

       //8-logic check for user creation
       if(!userCreatedSuccessfully){
        //server error
        throw new ApiError(500, "Error Occure while registering the user !!")
       }

       //9- return resApi
       // res.status (201) is liya diya postman expect krta h data response dene k liya
       return res.status(201).json(
        new ApiResponse(200, userCreatedSuccessfully, "User Register Successfully")
       )
       
 
}) 

export {registerUser}
