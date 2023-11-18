import { razorpay } from "../app.js";
import Payment from "../userschema/paymentschema.js";
import User from "../userschema/userSchema.js";
import AppError from "../utils/error.util.js";
import crypto from "crypto"
import {config} from "dotenv"
config()

const razorpayApikey=async(req,res,next)=>{
    res.status(200).json({
        success:true,
        messege:'RazorPay Api key',
        key: process.env.RAZORPAY_KEY_ID
    })
}


const buySubscription=async(req,res,next)=>{
    try {
        const {id}=req.user;
        const user=await User.findById(id);
        
        if(!user){
            return next(new AppError('Unauthourized,please Login',400));
        }
        if(user.role==="ADMIN"){
            return next(new AppError('ADMIN cannot purchase subscription',400));
         
        }


         const subscription=await razorpay.subscriptions.create({
            plan_id:process.env.RAZORPAY_PLAN_ID,
            customer_notify:1
         })


         user.subscription.id=subscription.id;
         user.subscription.status=subscription.status;


         await user.save();


         res.status(200).json({
            success:true,
            messege:'subscribed sucessfully',
            subscription_id:subscription.id
        })
        
        
    } catch (error) {
        return next(new AppError(error.messege,400));

    }

}

const verifyPayment=async(req,res,next)=>{
    try {
        const {id}=req.user;
        //payment gateway deta h  front end m ye sb fir appan aage bhejte h 
        const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body;
        
        
        const user= await User.findById(id);
        
        if(!user){
                    return next(new AppError('Unauthourized,please Login',400));
        
        }
        
        const subscription_id=user.subscription.id;
        
        const generatesignature=crypto 
                
            .createHmac("sha256",process.env.RAZORPAY_SECRET)//y na intitiate karega kyuki yaha razorpay secret embade hoga 
        
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)//kis basis p hash banega mtlb usme kya embed hoga 
        
            .digest('hex');//hexadecimal format m hash create hoga 
        
        if(generatesignature!==razorpay_signature){
            return next(new AppError('Payment not verified,please try again',400));
        
        }
          await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
          })
         
        
          user.subscription.status="active";
        
          await user.save()
          res.status(200).json({
            success:true,
            messege:'Payment verified sucessfully',
             })
          
    } catch (error) {
        return next(new AppError(error.messege,400));

    }

}

const cancelSubscription=async(req,res,next)=>{
      try {
        const {id}= req.user;

        const user=await User.findById(id);

        if(!user){
            return next(new AppError('Unauthourized,please Login',400));
        }
        if(user.role==="ADMIN"){
            return next(new AppError('ADMIN cannot purchase subscription',400));
         
        }

        const subscription_id=user.subscription.id;

        const subscription=await  razorpay.subscriptions.cancel(
            subscription_id
        )

        user.subscription.status=subscription.status;

        await user.save();

        res.status(200).json({
            success:true,
            messege:'Unsubsctribed  sucessfully',
             })
          

      } catch (error) {
        return next(new AppError(error.messege,400));

      }
}

const allPayments=async(req,res,next)=>{
    try {
        const{count}=req.query;

        const subscription= await razorpay.subscriptions.all({
            count:count||10
        })
    
        res.status(200).json({
            success:true,
            messege:'all payments',
            subscription
             })
    } catch (error) {
        return next(new AppError(error.messege,400));

    }
   
      

}

export{
    razorpayApikey,
    buySubscription,
    cancelSubscription,
    verifyPayment,
    allPayments
}