import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
//import { requestPasswordReset } from './authSlice';
import { memberRequestPasswordReset } from './memberSlice';

export const MemberRequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await dispatch(memberRequestPasswordReset(email));

      // Check if the action was fulfilled
      if (memberRequestPasswordReset.fulfilled.match(response)) {
        setMessage(response.payload.message);
      } else {
        setError(response.payload?.message || 'An error occurred.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div>
      <h2>Request Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
        <label htmlFor="email" className="form-label">Email:</label>
          <input
            className="form-control" 
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email" 
          />
        </div>
        <button type="submit" className="btn btn-primary">Request Reset Link</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

//export default MemberRequestPasswordReset;