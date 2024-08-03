import multer from "multer";


//locally file server pr rakhwane k liye multer use kare gy
// file save krwane k liye diskstorage use kare gy as middleware hi h
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      console.log( " diskStorage file!!! ", file)
      cb(null, file.originalname) // jo user ne diya h //update krana h
    }
  })
  
 export  const upload = multer({
   storage: storage
   })