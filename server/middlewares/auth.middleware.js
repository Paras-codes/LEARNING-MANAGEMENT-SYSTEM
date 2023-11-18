import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';
import {config} from "dotenv"
config();

const isLoggedIn=async(req,res,next)=>{
    try {
        const {token}=req.cookies;
        if(!token){
            return next(new AppError('unauthenticated user ,please login again',401));
        }
        const userDetails= jwt.verify(token,process.env.JWT_SECRET);
        
        req.user=userDetails
        console.log(JSON.stringify(req.user));
    
        next();
    
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token is expired',401));
            // Handle the expired token as needed, e.g. by sending a response to the user
        } else {
            return next(new AppError('err.message',401));

        }
    }
   
}

const authorizedRoles = (...roles) => async(req,res,next)=>{
    const currentUserRole=req.user.role;
    if(!roles.includes(currentUserRole)){
        return next(new AppError('You are not authourized to acess this route',401));
}
        next();
}
const authorizeSubscriber=async(req,res,next)=>{
    const subscription=req.user.subscription;
    const role=req.user.role;
    if(role!=="ADMIN"&&subscription.status!=='active'){
        return next(new AppError('You are not subscribed',401));
    }
    next();
    }

export{
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}