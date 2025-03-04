import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: { 
      type: String, 
      trim:true,
    },
    lastName: {
       type: String, 
       trim:true,
      },
    phoneNumber:{
     type:Number,
     trim:true
    },
    email: { 
      type: String, 
      unique: true,
    },
    password: { 
      type: String, 
    },
    confirmPassword:{
      type: String, 
    },
    role:{
    type:String,
     enum:["passenger","driver"],
     required:true
    },
    driverProfile: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref:"Driver",
      default: null
    },
    profileImage: { 
      type: String, 
      default: "" 
    },
    activationToken: {
      type: String,
    },
    authCode: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    previuosBooks:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Book"
       }
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
