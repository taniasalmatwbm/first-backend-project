// require('dotenv').config({ path:'./.env'}) improving better approach
// jesy hi db connect hu env hr a jaga jaha call hui h var chale jaye

import dotenv from 'dotenv' //improved
dotenv.config({path:'./.env'})


//import {app} from './app.js'

import db_conect from "./db/index.js";



db_conect()