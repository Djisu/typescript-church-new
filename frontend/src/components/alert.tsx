import React, { useState, useEffect } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number; // Duration in seconds
}

const Alert: React.FC<AlertProps> = ({ message, type, duration = 5 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration]);

  return isVisible ? (
    <div
      className={`alert alert-${type}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '10px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {message}
    </div>
  ) : null;
};

export default Alert;