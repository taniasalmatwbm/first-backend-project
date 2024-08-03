import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken'  //ye token hame jo b bhje ga usy data mil jaye ga
import bcrypt from 'bcrypt'  //password encrpt k liye

const userSchema = new Schema(
    {
      username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
      },
      // kahi pr n serch enable krna hu to index true rakhna huta h
      email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
      },
      fullName:{
        type: String,
        required:true,
        trim:true,
        index:true
      },
      avatar:{
        type:String,   //cloudinery url
        required:true,
      },
      coverImage:{
        type:String,  //cloudinery url
      },
      watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
      ],
      password:{
        type:String,
        required: [true, 'password is required']
      },

      refreshToken:{
         type: String,
      }

    },
    {
        timestamps: true    //created-at /updated-at
    }
)
//password ko asy incrypt nhi kiya ja sakta mongoose k khxh middlewarw hook lagte hn
//password ko incrypt krne ke liye middleware ka use karna h
// if es lie use kiye h jb application mein user khxh update kare ga ye password ko 
// change k k encrypt kare ga 
userSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next()

    this.password= await bcrypt.hash(this.password, 10)
    next()
})
 //custom method jo password again form mein ue kiya h pahle se compare k liye ye 
 // method bnaya h
 userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
 }

 userSchema.methods.generateAccessToken= function(){
    //JESY HI ACCESS token generate hu jata h jwt k us ko return kr deta h
       return jwt.sign(
        // keys payload k name h or object value db se arha h
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
 }
 userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        // keys payload k name h or object value db se arha h
        //bar bar refresh hute rehta h es liye serf id rakhein gy
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
 }

// Ye User database se direct connect kr sakta h
export const User=mongoose.model("User", userSchema)