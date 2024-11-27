import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
export const UserSchema = new Schema({
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
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const User = mongoose.model('User', UserSchema);
//# sourceMappingURL=Users.js.map