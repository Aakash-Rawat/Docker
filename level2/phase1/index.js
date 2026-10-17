import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import User from "./model/user.mode.js"
import Redis from 'ioredis';
import sendEmail from './config/sendEmail.js';
import rateLimitier from './middleware/rateLimit.js';
import emailQueue from './queue.js';
dotenv.config();
const app = express();
app.use(express.json())
export const redis = new Redis(process.env.REDIS_URL)


const port = process.env.PORT || 5000;



app.get('/',(req,res)=>{
   return res.status(200).json({
    message: "hello from redis"
   })
})

app.post('/create',async (req,res)=>{
      
   const {name,email,password} = req.body
   await redis.del("user:all")

      const user = await User.create({
         name,
         email,
         password
      })

    await emailQueue.add("send-email",{email});

    


      return res.json(user);
})


app.get('/get',rateLimitier,async(req,res)=>{
     const user = await User.find({})
     return res.json(user);
})

//with redis

app.get('/redis-get',rateLimitier,async(req,res)=>{
       const cached = await redis.get("user:all")

       if(cached){
         const Parseduser = JSON.parse(cached)
         return res.json(Parseduser)
       }

     const user = await User.find({})

      await redis.set("user:all",JSON.stringify(user))


     return res.json(user);
     
})


//otp generation
app.post('/send-otp', async(req,res)=>{

    const {email} = req.body;

    const otp = Math.floor(100000+Math.random()*900000).toString();

    await redis.set(`otp:${email}`, otp, "EX",90)

    return res.json({otp});

})

//otp verify
app.post('/verify-otp', async(req,res)=>{

    const {email,otp} = req.body;

    

    const Cachedotp = await redis.get(`otp:${email}`)

    if(!Cachedotp){
        return res.status(400).json({
         message:"otp not found or has been expired"
        })
    }

     if(Cachedotp !== otp){
        return res.status(400).json({
         message:"incorrect otp"
        })
     }

    return res.json({message:"verified otp"});

})












app.listen(port, ()=>{
   connectDb();
     console.log(`server started ${port}` )
})