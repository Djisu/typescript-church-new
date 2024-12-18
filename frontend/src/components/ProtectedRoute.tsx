//import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../app/store';
import { useAppSelector } from '../app/hooks';

const ProtectedRoute = () => {
    const username = useAppSelector((state: RootState) => state.auth.user?.username || '');
    const memberUsername = useAppSelector((state: RootState) => state.members.currentMember?.userName || '');

    console.log('ProtectedRoute:', username, memberUsername); // Debugging line

    const token = localStorage.getItem('token');

    // Optionally check token validity or expiration here
    const isAuthenticated = !!token; // Check if token exists

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if the user is authenticated
    if (!username && !memberUsername) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;