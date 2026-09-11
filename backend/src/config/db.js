import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Conected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Conection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;