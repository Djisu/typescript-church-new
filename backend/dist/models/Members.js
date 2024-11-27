import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
export const MemberSchema = new Schema({
    userName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    membership_type: { type: String, required: false }, // "regular member", "youth member", "senior member"
    status: { type: String, required: true }, // "pending approval", "approved", "rejected"
    affiliated: { type: String, required: false },
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
    token: '',
    resetToken: { type: String, default: null }, // Add this line
    resetTokenExpiration: { type: Date, default: null }, // Add this line
});
MemberSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const Member = mongoose.model('Member', MemberSchema);
//export default Member;
//# sourceMappingURL=Members.js.map