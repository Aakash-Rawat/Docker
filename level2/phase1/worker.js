import { Worker } from "bullmq";
import Redis from "ioredis";
import sendEmail from "./config/sendEmail.js";

const connection = new Redis("redis://localhost:6379",{
    maxRetriesPerRequest: null
})


console.log("hi")
const worker = new Worker("emailQueue",async (job)=>{
          console.log("job started");
          
    const email = job.data.email
          await sendEmail(email)
   console.log("job completed")
},{connection})


