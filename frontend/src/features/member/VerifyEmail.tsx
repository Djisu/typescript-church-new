import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VerifyEmail = () => {
    const { token } = useParams<{ token: string }>();

    useEffect(() => {
        const verifyEmail = async () => {
            // Extract nodeEnv from the URL query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const nodeEnv = urlParams.get('env');

            let frontendUrl: string;

            // Determine the frontend URL based on the extracted nodeEnv
            if (nodeEnv === 'development') {
                frontendUrl = 'http://localhost:3000';
            } else {
                frontendUrl = 'https://church-management-frontend.onrender.com';
            }

            const response = await fetch(`${frontendUrl}/api/members/verify/${token}`);
            const data = await response.json();

            // Handle the response (e.g., display a message)
            if (response.ok) {
                alert(data.message); // Success message
            } else {
                alert(data.message); // Error message
            }
        };

        verifyEmail();
    }, [token]);

    return <div>Verifying...</div>;
};

export default VerifyEmail;