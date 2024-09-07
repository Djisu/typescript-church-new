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
  verificationToken: string;
  isVerified: Boolean;
}

const MemberSchema: Schema = new Schema({
  username: { type: String, required: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  phone: { type: String, required: false },
  address: { type: String, required: false },
  membership_type:  { type: String, required: false }, // "regular member", "youth member", "senior member"
  status:  { type: String, required: true }, // "pending approval", "approved", "rejected"
  affiliated:  { type: String, required: false },
  joinedDate: { type: Date, required: false },
  attendanceRecord: [
    {
      date: { type: Date, required: false },
      attended: { type: Boolean, required: false },
    },
  ],
  tithes: [
    {
      date: { type: Date, required: false },
      amount: { type: Number, required: false },
    },
  ],
  offerings: [
    {
      date: { type: Date, required: false },
      amount: { type: Number, required: false },
    },
  ],
  smallGroups: [{ type: Schema.Types.ObjectId, ref: 'SmallGroup' }],
  ministries: [{ type: Schema.Types.ObjectId, ref: 'Ministry' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  verificationToken: {
    type: String,
    default: null, // This will store the token for email verification
  },
  isVerified: {
    type: Boolean,
    default: false, // This tracks whether the email has been verified
  },
});

export const Member = mongoose.model<IMember>('Member', MemberSchema);