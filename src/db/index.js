import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"


// Second Approach of connection Db
const db_conect = async ()=>{
    try{
    //connect hune k baad obj deta h response mein
     const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //jaha connect hua h complete url wo le lein
     console.log(`/n connectionInstance host -!!! ${connectionInstance.connection.host}`)
     //jesy hi db connect huti koi request jati app.js listen krta h yani express agr 
     //db connect hua h to app ko listen krna h warna error handle krna h

    }catch(err){
     console.log("error from connection" , err);
     //application kahi na kahi process kr rehi h us k ref de rehy hn node.js deta h
     process.exit(1)
    }
}


export default db_conect