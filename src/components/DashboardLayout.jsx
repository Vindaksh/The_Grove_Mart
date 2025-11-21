import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, TrendingUp, LayoutDashboard } from 'lucide-react';

function DashboardLayout() {
    const { user } = useAuth();
    const role = user?.role;

    // Reusable Sidebar Link Component
    const SidebarLink = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1
                ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
            }
        >
            <Icon size={20} />
            {label}
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex pt-16"> {/* pt-16 to account for fixed navbar */}

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden md:block overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        {role} Dashboard
                    </h3>
                    <nav>
                        {role === 'retailer' && (
                            <>
                                <SidebarLink to="wholesale" icon={TrendingUp} label="Wholesale Market" />
                                <SidebarLink to="inventory" icon={Package} label="My Inventory" />
                                <SidebarLink to="orders" icon={ShoppingBag} label="Customer Orders" />
                            </>
                        )}

                        {role === 'wholesaler' && (
                            <>
                                <SidebarLink to="" icon={LayoutDashboard} label="Dashboard Overview" />
                                <SidebarLink to="inventory" icon={Package} label="Manage Stock" />
                                <SidebarLink to="orders" icon={ShoppingBag} label="Retailer Orders" />
                            </>
                        )}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;