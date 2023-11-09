import User from "../userschema/userSchema.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary"
import fs from "fs/promises"
import sendEmail from "../utils/sendmail.js";
import crypto from 'crypto'

const cookieOptions={
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
    // secure: true
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
        const _id=req.user.id;
         
        const user= await User.findById({_id});
        console.log(JSON.stringify(user));
        res.status(200).json({
            success:true,
            message:"user details",
            user     
        })

    } catch (error) {
        return next(new AppError(error.message,400))
    }

}


const forgotpassword= async(req,res,next)=>{
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

    const  resetPasswordURL=`${process.env.FONTEND_URL}/reset-password/${resetToken}`

    const subject ='Reset Password'
    const message=`You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;
    console.log(resetPasswordURL);
//agar email send hojai to badiya warna user k reeference se uske pasword token undefined jisse ki wo phirse reset k atry karpai
    try {
        await sendEmail(email,subject,message)
        res.status(200).json({
            success:true,
            message:`Reset Password token has been send to ${email}`
        })
    } catch (error) {
        user.forgotPasswordExpiry=undefined,
        user.forgotPasswordToken=undefined;

        await user.save();
        return next(new AppError(error.message ,400))
}

}

const resetpassword= async(req,res,next)=>{
    const { resetToken } =req.params;
    const { password }=req.body;
//comparing token
//ye isliye kiya kyuki token banate waqt apan ne encrypt karke dala tha db m 
//so the main sycology is that we will encrpt the token with same alago and then find the user with the encrpted part if found that ok else user is not registered
    const forgotPasswordToken=crypto
        .createHash('sha256')//hashes are not encrpt and decrypt when first encryted cant be decrypted later
        .update(resetToken)
        .digest('hex');

    const user=await  User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{ $gt: Date.now()}//very important to keep acheck on expiry
    })

    if(!user){
        return next(new AppError('Token is invalid or expired,please try again',400));

    }

    user.password=password;

    // we have to modify them with the value undefined as their use is no more after updating the password 
    user.forgotPasswordToken=undefined;
    user.forgotPasswordExpiry=undefined;

    await user.save();


    res.status(200).json({
        success:true,
        message:`Your password is changed successfuly`
    })
}


const changePassword=async(req,res,next)=>{


    const {oldPassword,newPassword}=req.body;
    const _id=req.user.id;

    if(!oldPassword||!newPassword){
        return next(new AppError('All fields are mandatory',400))
    }

    const user=await User.findById({_id}).select('+password');

    if(!user){
        return next(new AppError('user doesnot exist',400))
}
    const PasswordIsValid=await user.comparePassword(oldPassword);

    if(!PasswordIsValid){
        return next(new AppError('Password does,nt match',400)) 
    }

    user.password=newPassword;

    await user.save();

    user.password=undefined;


    res.status(200).json({
        success:true,
        message:`Your password is changed successfuly`
    })
}


const updateUser=async(req,res,next)=>{


const {fullname}=req.body;
const _id=req.user.id;

const user=await User.findById({_id});

if(!user){
    return next(new AppError('user does,nt exist',400))
}
if(req.fullname){
user.fullname=fullname;
}
if(req.file){
   await cloudinary.v2.uploader.destroy(user.avatar.public_id) //to destroy the existed profile picture

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
 
await user.save();//saving the user in the database

res.status(200).json({
    success:true,
    message:`Your Profile is Updated sucessfully`
})
}


export {
    register,
    login,
    logout,
    getProfile,
    forgotpassword,
    resetpassword,
    changePassword,
    updateUser
}