import axios from 'axios';
import React, { useState } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://typescript-church-new.onrender.com');

const CaptivePortal: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>(''); // State to hold the phone number

  const handleConsent = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/members/capture-phone`, {
        consent: true,
        phoneNumber, // Include the phone number in the request body
      });

      if (response.data) {
        alert('Thank you! You are now connected to the Wi-Fi.');
        window.location.href = '/login'; // Redirect to the desired page
      } else {
        alert('Failed to grant access.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while trying to connect.');
    }
  };

  return (
    <div>
      <h1>Welcome to the Church Wi-Fi</h1>
      <p>Please consent to share your mobile phone number for attendance tracking.</p>
      <input
        type="tel" // Use 'tel' type for phone number input
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)} // Update state on input change
        required // Optionally mark as required
      />
      <button onClick={handleConsent}>Grant Access</button>
    </div>
  );
};

export default CaptivePortal;