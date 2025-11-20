import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import TextDivider from '../components/TextDivider';
import { AuthContext, useAuth } from '../context/AuthContext';

import Supabase from '../utils/Database';

const ROLE_LANDING_PATHS = {
    customer: '/dashboard',
    retailer: '/admin/retailer',
    wholesaler: '/admin/wholesaler',
};

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string>('');

    const { setLoading, setSession } = useContext(AuthContext);
    const { user, loading } = useAuth();
    const nav = useNavigate();

    // 1. Check if user is already logged in and redirect immediately
    useEffect(() => {
        if (!loading && user) {
            const redirectPath = ROLE_LANDING_PATHS[user.role] || '/dashboard';
            // Send user to their specific dashboard
            nav(redirectPath, { replace: true });
        }
    }, [user, loading, nav]); // Reruns when user state changes

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading();

        const { data, error } = await Supabase.auth.signInWithPassword({ email: email, password: password });
        if (error) {
            console.error("login failed: ", error);
            setError(error.message || 'Login failed. Please check your credentials.');
            setSession(undefined);
        } else if (data.session) {
            // Success: Set the session, which triggers AuthContext to fetch user details (including role),
            // and the useEffect hook above handles the navigation.
            setSession(data.session);
            // navigate is now handled by useEffect after AuthContext processes the user data
        }
    };

    const handle3rdPartyLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const fetchUserData = async () => {
            const { data, error } = await Supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "http://localhost:5173/" } });
            if (error) {
                console.error("Sign in failed: ", error);
                setError(error.message || 'Google sign-in failed.');
            }
        }
        fetchUserData();
    }

    if (loading || user) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Redirecting...</div>;
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Welcome Back!</h2>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="navigation">
                    <button type="submit" className="submit-btn">Login</button>
                </div>

                <TextDivider text='or' textColor='#000' lineColor='#000' lineThickness={0.5} />
                <div className="navigation OAuth">
                    <button type="button" className="next google" onClick={handle3rdPartyLogin}>Continue with Google</button>
                </div>
            </form>
            <p className="register-link">
                New to Live MART? <Link to="/register">Create an account</Link>
            </p>
        </div>
    );
}

export default LoginPage;