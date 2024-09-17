import mongoose from 'mongoose';
import config from 'config';
import { ConnectOptions } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

let db: string = config.get('mongoURI');

mongoose.set('strictQuery', true);

// Use the default connection URI or an environment variable if available
//db = process.env.MONGODB_URI || db;

console.log('db:', db);

// Store the connection status
let isConnected: boolean = false;

const connectDB = async () => {
   console.log('in connectDB')

  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    console.log('in about to connect');
    const dbURI: string =  'mongodb+srv://Djesu:Timbuk2tudjesu@cluster0.nlxec.mongodb.net/churchsoft?retryWrites=true&w=majority&appName=Cluster0';  //config.get('mongoURI'); // or use your connection string directly

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }  as ConnectOptions);

    isConnected = true; // Update connection status
    // console.log('MongoDB Connected...');
    // //
    // // Event listeners for the connection
    // mongoose.connection.on('connected', () => {
    //   console.log('Connected to MongoDB');
    // });

    // mongoose.connection.on('error', (err) => {
    //   console.error(`MongoDB connection error: ${err}`);
    // });

    // mongoose.connection.on('disconnected', () => {
    //   console.log('Disconnected from MongoDB');
    //   isConnected = false; // Update connection status
    // });
    // //

    // console.log('MongoDB Connected...');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    isConnected = false;

    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;








