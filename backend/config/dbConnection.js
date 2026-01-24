import mongoose from "mongoose";
import 'dotenv/config';


const connection = async () => {
    try {
        const base = process.env.MONGO_URI;
        if (!base) {
            throw new Error('MONGO_URI is not set');
        }

        const dbName = process.env.DB_NAME;
        const uri = dbName && !base.endsWith('/') ? `${base}/${dbName}` : base;
        await mongoose.connect(uri);
        console.log("✅ MongoDB Connected");
    } catch (e) {
        console.log("❌ Error connecting to MongoDB:", e?.message || e);
    }
};

export default connection;
