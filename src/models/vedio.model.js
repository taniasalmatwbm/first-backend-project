import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const videoSchema= new Schema(
       {
         videoFiles: {
            type: String,    //cloudinery url
            required: true
         },
         thumbnail: {
            type: String,      //cloudinery url
            required: true
         },
         videoFiles: {
            type: String,
            required: true
         },
         title: {
            type: String,
            required: true
         },
         descripation: {
            type: String,
            required: true
         },
         videoDuration: {
            type: Number,    //cloudinery se le gy
            required: true
         },
         views: {
            type: Number,    
            default: 0
         },
         isPublished: {
            type: Boolean,    
            default: true
         },
         owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
         }
       
    },
    {
        timestamps: true
     }
    
      
)
//khud se aggregation quries likh sakte hein
videoSchema.plugin(mongooseAggregatePaginate)

export const Video =mongoose.model("Video", videoSchema)