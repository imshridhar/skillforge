import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';
import { Loading } from '../components/common';

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: Array<'LEARNER' | 'INSTRUCTOR' | 'ADMIN'>;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <Loading variant="page" />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const redirectMap = {
            LEARNER: '/learner',
            INSTRUCTOR: '/instructor',
            ADMIN: '/admin',
        };
        return <Navigate to={redirectMap[user.role]} replace />;
    }

    return <>{children}</>;
};

export default RoleRoute;
