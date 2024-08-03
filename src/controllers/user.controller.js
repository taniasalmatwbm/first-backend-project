import { asyncHandler } from "../utils/asyncHandler.js"
//import {ApiResponse}  from "../utils/ApiResponse.js"
const registerUser= asyncHandler(async (req, res)=>{
    
    

       //9- return resApi
       // res.status (201) is liya diya postman expect krta h data response dene k liya
       return res.status(200).json({
        //new ApiResponse(200, userCreatedSuccessfully, "User Register Successfully")
        message: "taniya"
       }
        
       )
}) 

export {registerUser}
