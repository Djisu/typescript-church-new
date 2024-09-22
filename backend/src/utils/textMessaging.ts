import axios from 'axios';

const HUBTEL_API_KEY = 'your_hubtel_api_key';
const HUBTEL_API_SECRET = 'your_hubtel_api_secret';
const HUBTEL_SENDER_ID = 'your_hubtel_sender_id';

async function sendTextMessage(phoneNumber: string, message: string): Promise<void> {
  try {
    const response = await axios.post(
      'https://api.hubtel.com/v1/messages/send',
      {
        From: HUBTEL_SENDER_ID,
        To: phoneNumber,
        Content: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-ApiKey': HUBTEL_API_KEY,
          'X-Auth-ApiSecret': HUBTEL_API_SECRET,
        },
      }
    );

    console.log('Text message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
}

export { sendTextMessage };