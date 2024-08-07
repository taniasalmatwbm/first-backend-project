import {Router} from 'express'
import {
     loginUser,
     logoutUser,
      registerUser, 
      refreshAccessToken,
       changeCurrentPassword, 
       getCurrentUser, 
       updateAccountDetail, 
       updateProfilePicture,
        updateProfileCoverImage, 
        getWatchHistory, 
        getUserChannelProfile } from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { varifyJwt } from '../middlewares/auth.middleware.js'



const router = Router()
// register router se pahle mujh se mil k jana yani multer middleware
router.route("/register").post(
   //middleware register k sath ye b llety jana 
    upload.fields([
        {
         name: "avatar",
         maxCount: 1
        },
        {
         name: "coverImage",
         maxCount: 1
        }
    ]),
    registerUser)
//post method use kare gy ku k data lena h
router.route("/login").post(loginUser)
    
//secured routes
router.route("/logout").post(varifyJwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-password").post(varifyJwt, changeCurrentPassword)
router.route("/current-user").get(varifyJwt, getCurrentUser)
router.route("/update-account").patch(varifyJwt, updateAccountDetail)
router.route("/avatar").patch(varifyJwt, 
upload.single("avatar"), updateProfilePicture)
router.route("/cover-image").patch(varifyJwt,
upload.single("coverImage"), updateProfileCoverImage)
router.route("/c/:username").get(varifyJwt, getUserChannelProfile)
router.route("/history").get(varifyJwt, getWatchHistory)
//export default k purpose jaha import krna h we can use by any name 
export default router