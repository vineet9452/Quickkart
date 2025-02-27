import mongoose from "mongoose";
import colors from 'colors'

const connectDB= async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`connected to Mongodb Database ${conn.connection.host}`.bgYellow.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
}

export default connectDB;