import { Schema,model } from "mongoose";

const userSchema=new Schema({
     fullname:{
        type:String,
        required:[true,'please enter your full name'],
        trim:true,
        minlength:[5,'your name atleast have 5 characters'],
        maxlength:[50,'your name should not exceed 50 character'],
        lowercase:true,

     },
     email:{
        type:String,
        required:[true,'please enter your email'],
        trim:true,
        unique:true,
        lowercase:true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please fill in a valid email address',
          ], // Matches email against regex

     },
     password:{
        type:String,
        required:[true,'please enter your password'],
        minlength:[8,'your password must be atleast 8 characters'],
        select:false
 
     },
     avatar:{
        public_id:{
            type: String

        },
        source_url:{
            type:String
        }
     },
     role:{
      type:String,
      enum: ['USER','ADMIN'],
      default:'USER'
     },
     forgotPasswordToken:String,
     forgotPasswordExpiry:Date,


},{
    timestamps:true
});

const User=model('User',userSchema);

export default User