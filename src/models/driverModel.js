import mongoose, { Mongoose } from "mongoose";

const driverSchema = mongoose.Schema(
  {
    documentType: { 
     type:String,
     enum:["NIN","Driving License","Voters Card","Birth Certificate","International Passport"],
     required:[true,"Please Provide a valid document type"]
    },
    documentID:{
    type:String,
    trim:true,
    required:[true,"Please Provide a valid document Id"]
    },
    documentURL:{
     type:String,
     default:""
    },
    address:{
    type: String, 
    unique: true,
    trim:true,
    },
    dob: { 
      type:Date,
    },
    user:{
     type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;