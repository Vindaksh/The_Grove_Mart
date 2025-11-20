import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Central mapping for smart redirection
const ROLE_LANDING_PATHS = {
    customer: '/dashboard',
    retailer: '/admin/retailer',
    wholesaler: '/admin/wholesaler',
};

// Component to protect routes based on role and login status
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Show loading screen
    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading authentication session...</div>;
    }

    // 2. Not Logged In: If the route requires any role but none is present
    if (!user) {
        // Redirect to login, but pass the desired page in state so user is sent back after login
        alert("Please sign in to access this page.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Role Check: Check if the user's role is NOT in the allowed list
    if (allowedRoles && !allowedRoles.includes(user.role)) {

        // Determine the user's correct home page
        const redirectPath = ROLE_LANDING_PATHS[user.role] || '/';
        alert(`Access Denied for role ${user.role}. Redirecting.`);

        // Redirect the user to their own area
        return <Navigate to={redirectPath} replace />;
    }

    // 4. Access Granted
    return children;
}

export default ProtectedRoute;