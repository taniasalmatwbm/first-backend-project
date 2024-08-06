import {Router} from 'express'
import { loginUser, logoutUser, registerUser, refreshAccessToken } from '../controllers/user.controller.js'
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
//export default k purpose jaha import krna h we can use by any name 
export default router