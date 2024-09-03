//import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../app/store';
import { useAppSelector } from '../app/hooks';

const ProtectedRoute = () => {
    const username = useAppSelector((state: RootState) => state.auth.user?.name || '');
    return username ? <Outlet /> : <Navigate to="/login" replace />;
}
export default ProtectedRoute
