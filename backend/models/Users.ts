import mongoose, { Schema, Document, ObjectId, Types  } from 'mongoose';
import { ConnectOptions } from 'mongoose';
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  avatar?: string | null;
  token?: string | null;
  resetToken?: string | null; // Add this line
  resetTokenExpiration?: Date | null; // Add this line
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}

export const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: null },
  token: '',
  resetToken: { type: String, default: null }, // Add this line
  resetTokenExpiration: { type: Date, default: null }, // Add this line
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);