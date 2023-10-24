import { config } from "dotenv";
config()
import app from "./app.js";
import connectTodB from "./config/db.js";
// const nodemon=require("nodemon")

const Port=process.env.PORT||8000;

app.listen(Port,async ()=>{
     await connectTodB()
    console.log(`server is running at http:/localhost:${Port} `);
})