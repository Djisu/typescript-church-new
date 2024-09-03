import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  membership_type: string;
  status: string;
  affiliated: string;
  joinedDate: Date;
  attendanceRecord: { date: Date; attended: boolean }[];
  tithes: { date: Date; amount: number }[];
  offerings: { date: Date; amount: number }[];
  smallGroups: mongoose.Types.ObjectId[];
  ministries: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema({
  username: { type: String, required: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  phone: { type: String, required: true },
  address: { type: String, required: true },
  membership_type:  { type: String, required: true }, // "regular member", "youth member", "senior member"
  status:  { type: String, required: true }, // "pending approval", "approved", "rejected"
  affiliated:  { type: String, required: true },
  joinedDate: { type: Date, required: true },
  attendanceRecord: [
    {
      date: { type: Date, required: true },
      attended: { type: Boolean, required: true },
    },
  ],
  tithes: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
    },
  ],
  offerings: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
    },
  ],
  smallGroups: [{ type: Schema.Types.ObjectId, ref: 'SmallGroup' }],
  ministries: [{ type: Schema.Types.ObjectId, ref: 'Ministry' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Member = mongoose.model<IMember>('Member', MemberSchema);