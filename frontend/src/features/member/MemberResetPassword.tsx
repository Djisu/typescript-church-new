// ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { memberResetPassword } from './memberSlice';
import './ResetPassword.css';

interface ResetPasswordFormFields extends HTMLFormControlsCollection {
    email: HTMLInputElement,
    newPassword: HTMLInputElement,
  }
  interface ResetPasswordFormElements extends HTMLFormElement {
    readonly elements: ResetPasswordFormFields
  }

export const MemberResetPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      setToken(urlToken); // Set the token from the URL
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<ResetPasswordFormElements>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      //const response = await axios.post('/api/reset-password', { token, newPassword });
      setToken(token)
      const response = await dispatch(memberResetPassword({ token, newPassword }))

      // Check if the action was fulfilled
    if (memberResetPassword.fulfilled.match(response)) {
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

//export default MemberResetPassword;