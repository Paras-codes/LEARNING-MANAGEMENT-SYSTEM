import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import morgan from "morgan";
import userRouter from "./Router/userrouter.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import courseRouter from "./Router/course.route.js";
import paymentRouter from "./Router/payment.route.js"
import Razorpay from "razorpay"

const app=express();

export const razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID ,
    key_secret:process.env.RAZORPAY_SECRET
})


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:[process.env.client],
    credentials:true
}));

app.use(cookieparser());

app.use(morgan('dev'));//morgan logs about the acess of path by user


app.use("/api/user",userRouter)
app.use("/api/courses",courseRouter)
app.use("/api/payments",paymentRouter);

app.use("/HOME",(req,res)=>{
    res.send("GREAT TO SEE YOU")
})

app.all('*',(req,res)=>{
     res.status(404).send(" Error 404 Page not found ")
 })

 app.use(errorMiddleware)

export default app