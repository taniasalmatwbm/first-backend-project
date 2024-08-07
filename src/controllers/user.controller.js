import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiResponse}  from "../utils/ApiResponse.js"
import {ApiError} from  "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {cloudinaryUploadedfileMethod} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


const generateAccessandRefreshToken= async(userId)=>{
   try{
       const user =await User.findById(userId)
       // Now, user document available in db
       const refreshToken = user.generateRefreshToken() //methods
       const accessToken =user.generateAccessToken()
       //user.modle ko de diye method
       //resfreshToken db mein save b krwana h
       user.refreshToken= refreshToken
       //db method 
       await user.save({validateBeforeSave: false})

       return {refreshToken, accessToken}
   }catch(error){
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
   }
}
// register controller

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
       
      //4-logic check for images, check for avatar
      //register method se pahle multer use kiya h multer hame req.files deta h
      // req.files avatar and coverImage h
      // jesy hi submit kiya multer ne path ko apne server pr rakh liya
      //multer return path krta h jo k multer.midleware se a rha h
      console.log(req.files) // avatar & coverImage k array of object mein path aye ga
     const avatarLocalpath = req.files?.avatar[0]?.path;
     //const coverImageLocalpath = req.files?.coverImage[0]?.path;
      console.log(" multer se a rahi h files ", req.files)
      // ye es liye handle kiya error handle thek se nhi hu rha tha error ki samjh nhi lgy gi
      // error se koi baki data mein show hu ga
      let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

      if(!avatarLocalpath){
        throw new ApiError(400, "Avatar is required !!")
      }

      //5-logic upload them to cloudinary, avatar
       // image may be take time use await
       //must be check avatar it is required
       const avatar =await cloudinaryUploadedfileMethod(avatarLocalpath)
       const coverImage=await cloudinaryUploadedfileMethod(coverImageLocalPath)
 
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

// login controller

const loginUser= asyncHandler(async (req, res)=>{
   //1- req.body  => se login data le gy
   //2- username or email access kis pr krwana h
   //3- find user in db
   //4- password check 
   //5- access token or refresh token dono user ko de gy
   //6- send these token in cookies securly
   //7- successfully login

   //1:- logic  req.body  => se login data le gy
   const {username, email, password} =req.body
    console.log(email)
   //-----------------------------

   //2:-logic username or email access kis pr krwana h 
   //(!username) pr b serf krwa sakte (!email pr b) depend on requirment agr dono nhi diye
   //dono chaye
   if (!username && !email){
       throw new ApiError(400, "username or email must be required !!!")
   }
    //dono se ak cheya to if(!(username || email)){
    // throw new ApiError(400, "username or email must be required !!!")
    //}
   //-------------------------------

   //3-logic find user is available in database or note
   // mongodb mein jo chez pahle find hu gai
   // direct method of db
   const user= await User.findOne({
    $or :[{username}, {email}]
   })

   if(!user){
    throw new ApiError(404, "User does not exist in database")
   }

   //------------------------------

   //4-logic if user avail in db password check 
   // password check krne ke liye bcrypt compare function ka use krna h
   // user hamra mongodb k instance hn yahi se sare method user.model k acces kr sakte
   const isPasswordValid= await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401 ," invaild user password")
   }

   //-----------------------------------
  
   //5-logic access token or refresh token dono user ko de gy
   const {refreshToken, accessToken}= await generateAccessandRefreshToken(user._id)
    
   const loggedIn =await User.findById(user._id).select("-password -refreshToken")
   //console.log(loggedIn)
   //----------------------------------------
   //6-logic send these token in cookies securly
   // kis ki cookies mein bhjna h or how ?
   //user ko kiya kiya information bhjni h
    // cookies bhjne k liye khxh option likjne parte 
    //serf secure: true krne se frontend se koi b cookies ko modify kr sakta h
    // lkn jb httpOnly :true b sath mein true krty hn both to serf server se modify hu ga
   const option ={
       httpOnly: true,
       secure:   true,
   } 
// cookie cookie-parser se a raha h app se or middleware b inject kr diya hu ga
// "accessToken key h dosri value"
// cookie middleware h to loginUser mein req.cookie b li ja sakti h or res.cookie
// b bhji ja sakti h es liye logout k waqt khud ka middleware bna le gy 
   return res
   .status(200)
   .cookie("accessToken", accessToken, option)
   .cookie("refreshToken", refreshToken, option)
   .json(
    // hu sakta h frontend mein user save krna cha rha hu cookie mein to bhj diya dobra 
    // es liye bhja
    // ApiResponse.js mein ye sab ja raha h
     new ApiResponse(
      200,
      {
        user: loggedIn, accessToken, refreshToken
      },
      "User logged in succesfully"
     )
   )




})

//logout conroller
//---------------------
// yaha middleware use kare gy register hute waqt b to multer as middleware use kiya tha
// pic sath register mein le jany k liye tu yaha logout se pahle b khud k middleware 
// use kare gy
const logoutUser =asyncHandler(async (req, res) => {
  //middleware se aye ga
  //qyery mar kr pura userobjext le ayu ga or token delete kr du ga
  //findbyId b use kr sakte hn user lana pary ga refreshtoken delete krna pary ga 
  // save krna pary ga validateBefore false krba pary ga
  await User.findByIdAndUpdate(
    //logout krte hi refresh token db se delete hu jye ga
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }

    },
    {
      new: true
    }
  )
  //cookies lany h
  const option ={
    httpOnly: true,
    secure:   true,
  } 
  console.log("console by delete cookie !!", res)
  return res
  .status(200)
  .clearCookie("accessToken", option)
  .clearCookie("refreshToken", option)
  .json(new ApiResponse(200, {}, "User logged Out !!"))
  
})


 /* access token jb tk h ap jin feature ko access krne k authenticated hu kr 
# sakta (for examp-sign-up hu to login)lkn agr hamra login session 15 min 
# mein expire hu jta secure reason ki wja se phir hame again password deina hoga yaha
# 
# ata h resfresh token hame database mein b save rakhte hn or user ko b dety hn 
# user ko validate to access token se hi krty hn or user hr br password dalne ki zroort
# nhi h
# agr ap k pass ap k refresh token h to ak endpoint hit kr do agr waha se mary pass jo
# refresh token h or jo ap k pass refresh token h agr same h to mein ap ko ak naya access
# token de du ga 
# agr refresh token nhi match h to error return kr deta h */

// refresh Token
// endpoint hit krne k liye saab se pahle cookies se refresh token le gy
const refreshAccessToken= asyncHandler( async(req, res)=>{
  // req.body es liye hu sakta h moblie app use kr rha hu
  const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized Token")
  }
  // refresh token ko verify krna h
  // decoded token mila h agr information h to theek h warna token decoded mil jata h
  // warna jo user k passtoken gya h or database pass jo h dono alag h user k pass 
  // encrypted pochta h hamre database wala raw cheya
  // ab user.model mein bnaya hua refreshToken decode hu chuka h or waha ham ne jwt ko 
  // _id diya tha or es k access to huna cheya decodedToken k pass 
  // agr to access h to mein mongodb se query mar kr us user ki information le sakta hun
  // let's try
     try{
      const decodedToken= jwt.verify(incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
       )
  
       const user = await User.findById(decodedToken._id)
  
       if(!user){
        throw new ApiError(401,"Invalid Refresh Token !!!")
       }
       // yaha tak to valid hi token aya ga 
       // user.controller mein jo generateAccessandRefreshToken ne complete
       // dono token ko decode kr k diya tha or esy save b krwaya tha
       // match krna h 
       // incomingRefreshToken se _id de kr jo decode kr k jo user liya h us k 
       // pass b ak token hu ga us se match kare gy k same h ya nhi
       // agr to match nhi krty dono
       if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
       }
  
       // agr to match huta to generateAccessandRefreshToken jo k upr bnaya h
       // us se again token refresh kr dein gy
       //cookies mein bhjna h option to rakhne pary gy
  
      const options={
        httpOnly: true,
        secure: true
       }
       // refresh token generate krna h
      const {accessToken, newRefreshToken}= await generateAccessandRefreshToken(user._id)
       //refresh cookies mein b bhj dein gy or pora k pora response b bhj dein gy
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options)
       .json(
            new ApiResponse(
               200,
               {accessToken, refreshToken: newRefreshToken},
               "Access Token and Refresh Token generated successfully"
               // ab yaha tak endpoint h hamre pass
           )
       )
     }catch(error){
      throw new ApiError(401, error?.message || "Invalid refresh token")
     }
})

// changeCurrentPassword

 const changeCurrentPassword= asyncHandler(async(req, res)=>{
  const {oldPassword, newPassword} = req.body
  // if we want this we can
  //if(!(newPassword === confirmPassword)){}
  const user = await User.findById(req.user._id)
  const isCorrectPassword= await user.isPasswordCorrect(oldPassword)
  if(!isCorrectPassword){
    throw new ApiError(400, "Old password is incorrect")
  }
  // agr to correct password h to new password se update kr dein gy
  user.password = newPassword
  await user.save({validateBeforeSave: false})
  return res.status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
 })

 //How to get CurrentUser
 const getCurrentUser= asyncHandler(async(req, res)=>{
  return res.status(200)
  .json(200, req.user, "current User fetched successfully")
 })

 // kahi pr b agr file update krwa rehy hu to alag controller or endponit rakhna bhtr h
 // UpdateAccountDetail
 const updateAccountDetail= asyncHandler(async(req, res)=>{
      const {fullName, email}  = req.body
      if(!fullName && !email){
        throw new ApiError(400, "All feild are required")
      }

      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName: fullName,
            email:email,
          }
        },
        {
          //updated response milta h
          new: true,
        }
      ).select("-password")

      return res.status(200)
      .json(
        new ApiResponse(200, user, "Account updated successfully")
      )
 })

 //how to update files
 //multer middleware ki zroort hu gi taky files accept kr sakein or wahi log update kr payein gy jo 
 // logged in hu
 const updateProfilePicture= asyncHandler(async(req, res)=>{
  //jb multer inject kare gy req.file k option mil jaye ga
  const avatarLocalpath = req.file?.path
  if(!avatarLocalpath){
    throw new ApiError(400, "Please select a profile file pic")
  }
  //avatarLocalPath agr h to clodinary pr upload kr dein
  // name wali lena h jo user.model mein db ko det waqt diya tha
  const avatar = await cloudinaryUploadedfileMethod(avatarLocalpath)
  // avatar deleted todo
//avatar complete object mila h bhjna serf url h cloudinary pr
  if(!avatar.url){
    throw new ApiError(400, "Failed to upload file")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set:{
         avatar:avatar.url,
         }
    },
    {
      new: true
    }
  ).select("-password")

  return res.status(200)
  .json(
    new ApiResponse(201, user, "Avatar Images updated Successfully ") 
  )
  
 })

 //updateUserCoverImage
 const updateProfileCoverImage= asyncHandler(async(req, res)=>{
  //jb multer inject kare gy req.file k option mil jaye ga
  const coverImageLocalpath = req.file?.path
  if(!coverImageLocalpath){
    throw new ApiError(400, "Please select a coverImage file pic")
  }
  //avatarLocalPath agr h to clodinary pr upload kr dein
  const coverImage = await cloudinaryUploadedfileMethod(coverImageLocalpath)
//avatar complete object mila h bhjna serf url h cloudinary pr
  if(!coverImage.url){
    throw new ApiError(400, "Failed to upload file")
  }

 const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set:{
         coverImage : coverImage.url,
         }
    },
    {
      new: true
    }
  ).select("-password")

  return res.status(200)
  .json(
    new ApiResponse(201, user, "CoverImage Successfully updated") 
  )
  
 })

 const getUserChannelProfile= asyncHandler(async(req, res)=>{
  const {username} = req.params

  if(!username?.trim()){
    throw new ApiError(400, "Please enter a valid username")
  }
  //const user = await User.findOne({username}).select("-password")
  // es trha n kr sakte thy id niklte or further
  // lkn mongodb pipeline deta h to usi se kare gy
  // User.aggregate hamsha array deta h
  const channel = await User.aggregate([
    //first pipeline filter kr lein doument se
    {
      $match:{ 
        username: username?.toLowerCase()
      }
    },
    //ak channel h taniyorcode tu us k subscriber find krne k liye lookup use kare gy
    //model k name k first words small or and pr s lg jta h
    {
      $lookup:{ 
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"   // depends on us
      }
    },
    //taniyaorcode ne ketne channel subscribe kkiye hein
    //ab ki dafa aya ga foreignField mein subscriber es k subscription.model 
    //se name k thek pta chlta h
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"   // depends on us jin ko subscribe kiya hua h
      }
    },
  //ab en ko add krna h ye kiya kare k users ki sari feild mein khxh or field add kr dega
    // upr tu sari feilds ko Eketha kriya h 
    //channel k subscriber ketne h 
   // $size :"$subscribers" subscribers k sath $ lgy ga ku k ab ye b feild h
    {
      //es dono ko user mein add kiya h
      $addFields:{
         subscriberCount: {
            $size :"$subscribers"
         },
         channelSubscribedToCount: {
            $size :"$subscribedTo"
         },
         // ab ham un k subscribers list mein h ya nhi 
         // req.user._id, "$subscribers.subscriber" subrs k list  mein se subr docu mein
         // id nikal lein
         // condition lgai h $in obj mein b dekh leta h or array mein b 
         // $subscribers.subscriberye obj mein h
         isSubscribed: {
          $cond:{
            if:{$in:[req.user._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
         
         }
      }
    },
    //mein sari values nhi du ga serf selected dun ga
    {
      $project:{
        //flag on kiya h ye mil jaye ga
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }

  ])
  console.log("what channel aggregate give us ", channel)

  if(!channel?.length){
    throw new ApiError(404, "channel not found")

  }
    //complete obj nhi bhja serf 0 index bhj diya
     return res.status(404)
     .json(
      new ApiResponse(200, channel[0], "User channel fetched succesfully")
     )
 })

 const getWatchHistory = asyncHandler(async(req, res)=>{
  //watch history mein id cheya or mongoose hame direct mongodb ki direct string
  // id nhi deta lkn leny k liye method zroor deta h
    const user =await User.aggregate([
      {
        //hamra id mongodb k object id se match hu gya h 
        //ab hame user mil gya h watch history mein jna pary ga lookup krna pary ga
        $match:{
          _id: new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $lookup:{ 
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory" ,    // yaha hamre pass boht sari videos a gai hn
           pipeline:[
            {   //ab yaha videos mein hein ham or lookup ki pipeline bana rehy 
              //users mein lookup krna h hme
              $lookup:{
                from: "users",   //or yaha hamre array mein users ki sari feild mil gai h
                localField: "owner",  //lkn ham ne own mein serf khxh hi field deni h
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  //ab jetni b field h owner mein chali jayein gi
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1
                    }

                  }  
                ]
              }
            },
            {
              //sara array mily ga owner k lkn hame serf  index cheya
              $addFields:{
               // owner:{$arrayElemAt:["$owner",0]} also can
               owner:{$first: "$owner"}  //seedha owner obj mil jaye ga . kr k nikal le gy

              }
            }
           ]
        }
      }

    ])

    return res.status(200)
    .json(
     new ApiResponse(200, user[0].watchHistory, "watch history fetched succesfully")
    )



 })

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetail,
  updateProfilePicture,
  updateProfileCoverImage,
  getUserChannelProfile,
  getWatchHistory
}
