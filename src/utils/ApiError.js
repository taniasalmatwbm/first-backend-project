class ApiError extends Error {


    constructor(
        statusCode,
        message="something want wrong",
        errors=[],
        stake =""
    ) {
      super(message)
      this.statusCode= statusCode
      this.data= null
      this.message= message
      this.success= false;
      this.errors= errors
        
        if(stake){
        this.stake=stake
       } else{
        Error.captureStackTrace(this, 
            this.constructor)
      }
    }
}


export {ApiError}