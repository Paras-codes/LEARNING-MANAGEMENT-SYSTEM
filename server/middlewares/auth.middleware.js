import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';
import {config} from "dotenv"
config();

const isLoggedIn=async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new AppError('unauthenticated user ,please login again',401));
    }
    const userDetails= jwt.verify(token,process.env.JWT_SECRET);
    
    req.user=userDetails
    console.log(JSON.stringify(req.user));

    next();

}

export{
    isLoggedIn
}