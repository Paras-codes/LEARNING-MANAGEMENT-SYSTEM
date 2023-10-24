import mongoose from "mongoose";
import {config} from "dotenv";
config();

mongoose.set('strictQuery',false)

const connectTodB= async ()=>{
        mongoose.connect(process.env.MONGO_URI)
        .then((conn)=>{
             console.log(`connected to database ${conn.connection.host} `);
        })
        .catch((err)=>{
            console.log(err);
            process.exit(1);
        })
}

export default connectTodB;