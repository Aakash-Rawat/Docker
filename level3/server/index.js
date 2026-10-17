import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
const app = express();


const port = process.env.PORT || 5000;



app.get('/',(req,res)=>{
   return res.status(200).json({
    message: "hello from server"
   })
})


app.listen(port, ()=>{
     console.log("server started")
})