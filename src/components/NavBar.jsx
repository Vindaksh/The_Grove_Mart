import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import  Supabase from '../utils/Database';
import { useCart } from '../context/CartContext';
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; 
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { cartItems } = useCart();
  const cartItemCount = cartItems.length;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) navigate('/profile');
    else navigate('/login');
  };

  return ( 
    <nav className="navbar">
    <Link to="/" className="navbar-brand"> Live MART </Link>
     <div className="navbar-links">
     <Link to="/dashboard">Products</Link> 
     <Link to="/cart"> Cart ({cartItemCount}) </Link> 
    
        
     <button onClick={handleAuthClick}>
        {user ? 'Profile' : 'Sign In'}
      </button>
     </div> 
     </nav>
    );



//   return (
//     <nav className="navbar">
//       <button onClick={handleAuthClick}>
//         {user ? 'Profile' : 'Sign In'}
//       </button>
//     </nav>
//   );
}

export default Navbar;
