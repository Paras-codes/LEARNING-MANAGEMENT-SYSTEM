import mongoose from "mongoose";
import {config} from "dotenv";
config();

mongoose.set('strictQuery',false)

const connectTodB= async ()=>{
    try{
       const {connection}= await mongoose.connect(process.env.MONGO_URI)
        if(connection){
          console.log(`connected to database ${ connection.host } `);

        }
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectTodB;