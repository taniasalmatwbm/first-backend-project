// require('dotenv').config({ path:'./.env'}) improving better approach
// jesy hi db connect hu env hr a jaga jaha call hui h var chale jaye

import dotenv from 'dotenv' //improved
dotenv.config({path:'./.env'})


import {app} from './app.js'

import db_conect from "./db/index.js";


//app db se connect hune k baad listen krti h
db_conect()
.then(()=>{
    app.on('error', (error)=>{
       console.log(`Error from app on listner ${error}`)
       throw error
    })

   app.listen(process.env.PORT || 8000, ()=>{
       console.log(`Serving is running on this port ${process.env.PORT || 8000}`)
   })
})
.catch((err)=>{
   console.log(`Running is coming from server listner ${err}`)
})