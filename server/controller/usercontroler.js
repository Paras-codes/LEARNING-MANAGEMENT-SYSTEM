import User from "../userschema/userSchema.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary"
import fs from "fs/promises"


const cookieOptions={
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
    secure: true
}


const register= async (req,res,next)=>{
   const {fullname,email,password}=req.body;
   
   
   if(!fullname||!email||!password){
    return next(new AppError('allfields are required',400));
   }
   try{

   const userExist= await User.findOne({email})
   
   if(userExist){
    return next(new AppError('email already exist',400));
    
   }
   
   const user= await User.create({
    fullname,
    email,
    password,
    avatar:{
        public_id:email,
        source_url:"https://cloudnary.com/",
    }
 })

//  cloudnarylogic sabse ppahle cloudnary k configuration define honge
console.log("file details  >" ,JSON.stringify(req.file));
if(req.file){
    try {
       const result=await cloudinary.v2.uploader.upload(req.file.path,{
        //configuration ki kis type m upload hoga
        folder:"lms",//kis folder m save hoga cloudinary server
        width:250,//width of the image 
        height:250,//height of the image
        gravity:'faces',//face p jyada focus karna agar crop kar bhi rahe ho to
        crop:'fill'//crop jab karo to uska background emptyy nii hona chahiye 
       })
       if(result){
        user.avatar.public_id=result.public_id;
        user.avatar.source_url=result.secure_url;

        //remove file from this server jo middle ware se upload folder m banai thi
        fs.rm(`uploads/${req.file.filename}`)

       }
    } catch (error) {

        return next(new AppError(err.message||'file not uploaded ,please try again',500));
    }
}
 await user.save();
  user.password=undefined;//kabhi bhi banao to yaad rakhna ki password ko hata do

  //login k liye tocken banalo register karliya na to direct login karao

  const token= await user.generateJWTToken();
   
  res.cookie('token',token,cookieOptions)

  res.status(201).json({
    success:true,
    message:"user registered sucessfully",
    user
  })
   }
   catch(err){
    return next(new AppError(err.message,400));
   }

   
}




const login = async (req,res,next)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
    
            return next(new AppError('allfields are required',400));
        }
        
        const user=await User.findOne({
            
            email
    
        }).select('+password')
    
    
        if(!user||!user.comparePassword(password)){
            return next(new AppError('user or password doesent exist',400));
        }
    
        const token=await user.generateJWTToken()//user ka instance already diya hua h na 
        user.password=undefined;
    
        res.cookie('token',token,cookieOptions)
    
        res.status(200).json({
            success:true,
            message:"user logged in successfully",
            user
            
        })
        
    } catch (error) {
        return next(new AppError(error.message,400));

    }
   
}




const logout =(req,res)=>{
    // logout ka sabse accha method cookie ko delete kardo 
    res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:"user logged out successfully",
        
    })
}





const getProfile=async (req,res,next)=>{
    try {
        const userId=req.user.id;
        const user=  User.findById({userId});
        res.status(200).json({
            success:true,
            message:"user details",
            user     
        })

    } catch (error) {
        return next(new AppError(error.message,400))
    }

}


const forgotpassword= async(req,res)=>{
//    forgot ppassword flow is a two step process 
// 1. email> validateemail> dynamictokengeneration> urlsend>  tokensave with tokenexpiry
// 2.  gettoken > tokenvalidationfrom db >updatePassword

const {email}=req.body;
 if(!email){
    return next(new AppError('email is required',400))
 }
const user= await User.findOne({email})
 if(!user){
    return next(new AppError('email not registered',400))
 }
  const resetToken=await user.generatePasswordResetToken();

  await user.save()

}

const resetpassword= async(req,res)=>{

}

export {
    register,
    login,
    logout,
    getProfile,
    forgotpassword,
    resetpassword
}