import mongoose from 'mongoose'

const connectDb = async()=>{
        try {
             
            await mongoose.connect(process.env.MONGO_URI)
          console.log("Database connected")

        } catch (error) {
            return res.status(404).json({
                message:error
            })
        }
}

export default connectDb;