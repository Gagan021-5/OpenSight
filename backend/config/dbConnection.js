import mongoose from "mongoose";
import 'dotenv/config';


const connection = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log("✅ MongoDB Connected");
    } catch (e) {
        console.log("❌ Error connecting to MongoDB:", e);
    }
};

export default connection;
