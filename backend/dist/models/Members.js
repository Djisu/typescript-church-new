"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Member = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MemberSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    membership_type: { type: String, required: true }, // "regular member", "youth member", "senior member"
    status: { type: String, required: true }, // "pending approval", "approved", "rejected"
    affiliated: { type: String, required: true },
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
    smallGroups: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'SmallGroup' }],
    ministries: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Ministry' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.Member = mongoose_1.default.model('Member', MemberSchema);
//# sourceMappingURL=Members.js.map