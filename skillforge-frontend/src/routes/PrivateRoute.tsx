import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/store';
import { Loading } from '../components/common';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <Loading variant="page" message="Authenticating..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
