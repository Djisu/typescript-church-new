import mongoose from 'mongoose';
import config from 'config';
import { ConnectOptions } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

let db: string = config.get('mongoURI');

mongoose.set('strictQuery', true);

// Use the default connection URI or an environment variable if available
db = process.env.MONGODB_URI || db;

console.log('db:', db);

const connectDB = async () => {
  try {
    console.log('in about to connect');

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }  as ConnectOptions);

    console.log('after await mongoose.connect(db)');
    //
    // Event listeners for the connection
    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Disconnected from MongoDB');
    });
    //

    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.log(err.message);

    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;








