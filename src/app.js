import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'



const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential:true,
}))

// form se data ki limit rakhi h ta ke server crash na kare
app.use(express.json({
    limit: '16kb'
}))

// request jb server pr jaye gi us ko handle karne k liye spacing wagra b
app.use(express.urlencoded({extended: true, limit: '16kb'}))

// file ye folder store krwane k liye public rakhein gy koi b acces kr sakta h
app.use(express.static("public"))

//SERVER se user k browser us ki cookies ko access b kr lu or set b us k liya CURD operate
// khxh tareko se ap secure cookies user k browser mein rakh sakte hn jesy server hi read 
//or delete kr sakta h
app.use(cookieParser())




export {app}