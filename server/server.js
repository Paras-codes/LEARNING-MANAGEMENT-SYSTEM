import { config } from "dotenv";
config()
import app from "./app.js";
import connectTodB from "./config/db.js";
import cloudinary from "cloudinary";
import AppError from "./utils/error.util.js";

// const nodemon=require("nodemon")

const Port=process.env.PORT||8000;
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

})

app.listen(Port,async ()=>{
    try{
     await connectTodB()
    console.log(`server is running at http:/localhost:${Port} `);
    }
    catch(err){
        return next(new AppError(err.message,400));

    }
})