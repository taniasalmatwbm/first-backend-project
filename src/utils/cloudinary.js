import {v2 as cloudinary } from 'cloudinary'
import fs from 'fs'   //node hame files ko handle krne k liye fs deta h

// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET, 
        // Click 'View Credentials' below to copy your API secret
        
    });

    const cloudinaryUploadedfileMethod= async (localFilePath)=>{
        try {
           if(!localFilePath)  return null //console('file link not avilable')
           const response = await cloudinary.uploader.upload(localFilePath, {
             resource_type: "auto"
            })

            //file has been uploaded success fully
            console.log('file uploaded successfully on cloudinary', response.url );
            console.log(response)
            //user ko b khxh na khxh return krna pary ga
            fs.unlinkSync(localFilePath) 
             //folder k public temp se file khud unlink hu jaye gi sync 
            return response;
        }catch(error){
            fs.unlinkSync(localFilePath)
              // , (error) => {    
              //   if (error) {
              //     console.error('Error removing local file:', error);
              //   }
              // });
           //removed the locally temporary saved file as upload operation got failed
           return null
        }
    }
    export {cloudinaryUploadedfileMethod}