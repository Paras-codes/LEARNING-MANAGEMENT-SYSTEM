import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import morgan from "morgan";


const app=express();

app.use(express.json());

app.use(cors({
    origin:[process.env.client],
    credentials:true
}));

app.use(cookieparser());

app.use(morgan('dev'));//morgan logs about the acess of path by user



app.use("/ping",(req,res)=>{
    res.send("/Pong")
})

app.all('*',(req,res)=>{
     res.status(404).send(" Error 404 Page not found ")
 })

export default app