import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Store, Package } from 'lucide-react';

function HomePage() {
    const { user } = useAuth();

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col bg-rose-50/50">

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Funky Background Blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-white rounded-b-[50%] shadow-xl shadow-rose-100/50 z-0"></div>

                <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl mb-6">
                        Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">MART</span>
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        The best way to shop local. Connecting retailers, wholesalers, and customers in one happy loop! 🛍️
                    </p>

                    <div className="mt-10 max-w-sm mx-auto sm:max-w-none flex justify-center gap-4">
                        {user ? (
                            <Link
                                to={user.role === 'customer' ? "/dashboard" : `/admin/${user.role}`}
                                className="px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-rose-500 hover:bg-rose-600 hover:scale-105 transition-all"
                            >
                                Go to Dashboard &rarr;
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="px-8 py-3 border border-transparent text-base font-bold rounded-full shadow-lg shadow-rose-200 text-white bg-rose-500 hover:bg-rose-600 hover:-translate-y-1 transition-all"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-3 border-2 border-rose-200 text-base font-bold rounded-full text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-300 transition-all"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'For Customers',
                                description: 'Find hidden gems in your neighborhood and get them delivered with love.',
                                icon: ShoppingCart,
                                color: 'bg-rose-100 text-rose-600'
                            },
                            {
                                title: 'For Retailers',
                                description: 'Manage your shop with a smile. Easy inventory and happy customers.',
                                icon: Store,
                                color: 'bg-orange-100 text-orange-600'
                            },
                            {
                                title: 'For Wholesalers',
                                description: 'Move bulk stock without the bulk stress. Streamlined and simple.',
                                icon: Package,
                                color: 'bg-purple-100 text-purple-600'
                            }
                        ].map((item) => (
                            <div key={item.title} className="relative group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                                <div className={`absolute top-8 right-8 p-3 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mt-4">{item.title}</h3>
                                <p className="mt-4 text-slate-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;