import User from "../userschema/userSchema.js";
import AppError from "../utils/error.util.js";
const register=(req,res,next)=>{
   const {fullname,email,password}=req.body;
   
   
   if(!fullname||!email||!password){
    return next(new AppError('allfields are required',400));
   }

   const userExist=User.findOne({email});
   
}

const login =(req,res)=>{

}

const logout =(req,res)=>{
    
}

const getProfile=(req,res)=>{
    
}

export {
    register,
    login,
    logout,
    getProfile
}