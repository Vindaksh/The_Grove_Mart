import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

function DashboardLayout() {
    const { user } = useAuth();
    const role = user?.role;

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-sidebar">
                <h3>Dashboard</h3>

                {/* Retailer Links */}
                {role === 'retailer' && (
                    <>
                        {/* 'wholesale' is relative to /admin/retailer/ */}
                        <Link to="wholesale">Wholesale Market</Link>
                        <Link to="inventory">Manage Inventory</Link>
                        <Link to="orders">Customer Orders</Link>
                    </>
                )}

                {/* Wholesaler Links */}
                {role === 'wholesaler' && (
                    <>
                        {/* '' is the index route, which redirects to WholesalerDashboard */}
                        <Link to="">Dashboard</Link>
                        <Link to="inventory">Manage Stock</Link>
                        <Link to="orders">Retailer Orders</Link>
                    </>
                )}
            </nav>
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;