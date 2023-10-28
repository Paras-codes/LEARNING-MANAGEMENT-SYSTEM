import User from "../userschema/userSchema.js";
import AppError from "../utils/error.util.js";

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

   const userExist=User.findOne({email});
   
   if(userExist){
    return next(new AppError('email already exist',400));
   }
   
   const user= await User.create({
    fullname,
    email,
    password,
    avatar:{
        public_id:email,
        secure_url:""
    }
 })

 //todo  : file upload
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
            return next(new AppError('user doesent exist',400));
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
        const user= await  User.findById({userId});
        res.status(200).json({
            success:true,
            message:"user details",
            user     
        })

    } catch (error) {
        return next(new AppError('failed to fetch profile',400))
    }

}

export {
    register,
    login,
    logout,
    getProfile
}