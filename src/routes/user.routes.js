import {Router} from 'express'
import { registerUser } from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'



const router = Router()
// register router se pahle mujh se mil k jana yani multer middleware
router.route("/register").post(
    
    upload.fields([
        {
         name: "avatar",
         maxCount: 1
        },
        {
         name: "coverImage",
         maxCount: 1
        }
    ]),registerUser)
    
    

//export default k purpose jaha import krna h we can use by any name 
export default router