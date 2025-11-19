import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {getUserDetails} from '../utils/Database';
import {UserInterface} from '../utils/Interfaces';

function HomePage() {
    const { user: userData, loading } = useContext(AuthContext);
    const pageStyle: React.CSSProperties = {
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        paddingLeft: '50px',
        paddingRight: '50px'
    };
    
    return (
        <div style={pageStyle}>
            <h1 style={{ color: '#000000ff' }}>
                Welcome to Live MART
            </h1>
            <p style={{ fontSize: '18px', color: '#000000ff' }}>
                Your one-stop online delivery system.
            </p>
            {(loading)?
            <p style={{ fontSize: '18px', color: '#000000ff' }}>Loading...</p>
            :((userData)?
            <p style={{ fontSize: '18px', color: '#000000ff' }}>Hello {userData!.name}</p>
            :
            <Link to="/register" style={{ fontSize: '20px', color: '#00008B' }}>
                Go to Registration Page
            </Link>
            )}
        </div>
    );
}

export default HomePage;