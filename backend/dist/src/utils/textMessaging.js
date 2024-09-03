"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTextMessage = sendTextMessage;
const axios_1 = __importDefault(require("axios"));
const HUBTEL_API_KEY = 'your_hubtel_api_key';
const HUBTEL_API_SECRET = 'your_hubtel_api_secret';
const HUBTEL_SENDER_ID = 'your_hubtel_sender_id';
function sendTextMessage(phoneNumber, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post('https://api.hubtel.com/v1/messages/send', {
                From: HUBTEL_SENDER_ID,
                To: phoneNumber,
                Content: message,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-ApiKey': HUBTEL_API_KEY,
                    'X-Auth-ApiSecret': HUBTEL_API_SECRET,
                },
            });
            console.log('Text message sent successfully:', response.data);
        }
        catch (error) {
            console.error('Error sending text message:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=textMessaging.js.map