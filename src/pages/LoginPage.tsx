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

    // Get the core functions and state from AuthContext
    const { setLoading, setSession, stopLoading } = useContext(AuthContext); // <<< Use stopLoading
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // 1. Redirect already logged-in users
    useEffect(() => {
        if (!loading && user) {
            const redirectPath = ROLE_LANDING_PATHS[user.role] || '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        // Start loading to show 'Redirecting' screen
        setLoading();

        const { data, error } = await Supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Login failed: ", error);
            setError(error.message || 'Login failed. Check email or password.');

            stopLoading();
        } else if (data.session) {
            setSession(data.session);
        }
    };

    const handle3rdPartyLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const fetchUserData = async () => {
            const { error } = await Supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: "http://localhost:5173/" }
            });
            if (error) {
                console.error("Sign in failed: ", error);
                setError(error.message || 'Google sign-in failed.');
            }
        }
        fetchUserData();
    }

    // Show redirecting state if loading OR user is valid
    if (loading || user) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Redirecting...</div>;
    }

    // Render the form only if not loading AND no valid user is present
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