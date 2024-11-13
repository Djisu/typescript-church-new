// ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { resetPassword } from './authSlice';
import './ResetPassword.css';

interface ResetPasswordFormFields extends HTMLFormControlsCollection {
    email: HTMLInputElement,
    newPassword: HTMLInputElement,
  }
  interface ResetPasswordFormElements extends HTMLFormElement {
    readonly elements: ResetPasswordFormFields
  }

const ResetPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState<string>('');
  let [url, setUrl] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    const urlNodeEnv = new URLSearchParams(window.location.search).get('env');

    console.log('urlToken: ', urlToken)
  
    let newUrl: string = ''
    if (urlNodeEnv === 'development') {
      newUrl = 'http://localhost:3000/reset-password';
      url = newUrl;
      setUrl(url);
    } else if (urlNodeEnv === 'production') {
      url = 'https://typescript-church-new.onrender.com/reset-password';
      newUrl = 'https://typescript-church-new.onrender.com/reset-password';
      setUrl(url);
    }
  
    // Validate token format
    if (urlToken && /^[a-f0-9]{64}$/.test(urlToken)) {
      setToken(urlToken); // Set the token only if it's valid
    } else {
      console.error('Invalid or missing token in the URL');
      // Handle the error, e.g., redirect the user or show a message
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<ResetPasswordFormElements>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      //const response = await axios.post('/api/reset-password', { token, newPassword });
      //setToken(token)
      const response = await dispatch(resetPassword({ token, newPassword }))

      // Check if the action was fulfilled
    if (resetPassword.fulfilled.match(response)) {
        setMessage(response.payload.message);
      } else {
        setError(response.payload?.message || 'An error occurred.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ResetPassword;