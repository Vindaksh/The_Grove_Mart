// --- File: src/components/NavBar.jsx (FINAL ROLE-AWARE VERSION) ---
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Supabase from '../utils/Database';
import "./NavBar.css";

function NavBar() {
    const { cartItems } = useCart();
    const { user, session } = useAuth();
    // Calculate total quantity for the cart badge
    const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

    const handleLogout = async () => {
        // Clear session and redirect will be handled by AuthContext
        const { error } = await Supabase.auth.signOut();
        if (error) {
            console.error("Logout failed:", error);
            // We use alert here because we are logging out globally
            alert("Logout failed. Please try again.");
        }
    };

    // Centralized function to determine where the main logo/home link goes
    const getRoleLandingPath = (role) => {
        if (!role) return '/';
        switch (role) {
            case 'retailer': return '/admin/retailer';
            case 'wholesaler': return '/admin/wholesaler';
            case 'customer': return '/dashboard';
            default: return '/';
        }
    };

    const isAdmin = user && (user.role === 'retailer' || user.role === 'wholesaler');
    const landingPath = getRoleLandingPath(user?.role);


    // --- Dynamic Links Render ---
    const renderNavLinks = () => {
        // 1. Guest/Customer View
        if (!user || user.role === 'customer') {
            return (
                <>
                    {/* The Products link is now only visible to Guests/Customers */}
                    <Link to="/dashboard">Products</Link>
                    {user && <Link to="/cart">Cart ({cartItemCount})</Link>}
                    {user && <Link to="/profile">Profile</Link>}
                </>
            );
        }

        // 2. Retailer/Wholesaler (Admin) View
        if (isAdmin) {
            return (
                <>
                    {/* The main dashboard link is handled by the logo */}

                    {/* Retailers need a cart link for wholesale orders */}
                    {user.role === 'retailer' && <Link to="/cart">Cart ({cartItemCount})</Link>}

                    {/* All admins need to access their profile */}
                    <Link to="/profile">Profile</Link>
                </>
            );
        }
    };

    return (
        <nav className="navbar">
            {/* The main logo always sends the user to their appropriate landing page */}
            <Link to={landingPath} className="navbar-brand">
                Live MART
            </Link>
            <div className="navbar-links">
                {renderNavLinks()}

                {user ? (
                    <button onClick={handleLogout} className="nav-logout-btn">
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="nav-login-btn">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default NavBar;