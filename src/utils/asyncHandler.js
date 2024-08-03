//wrapper for all fun that must be return promise
const asyncHandler=(requestHandler)=>{
    
    return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=>next(err))
     }
 }
 
 export {asyncHandler}
 
 
 // const asyncHandle=()=>{}
 // const asyncHandle= (fun)=> ()=>{}
 // const asyncHandle= (fun)=> async()=>{}
 
     //wrapper fun
 
 // const asyncHandle= (fun)=> async(err, req, res, next)=>{
 //     try {
 //           await fun(req, res, next)
 //     }catch(error){
 //       res.status(err.code || 500).json({
 //         success: false,
 //         message: err.message
 //       })
 //     }
 // }