// src/components/ProfileSidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RetailerProfileSidebar() {
    const { logout } = useAuth();
  return (
    <aside className="profile-sidebar">
      <h2 className="sidebar-title">Account</h2>

      <ul className="sidebar-links">
        <li>
          <NavLink 
            to="/profile/addresses" 
            className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            Addresses
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/profile/orders" 
            className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            Orders
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/cart" 
            className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            Cart
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/profile/settings" 
            className={({ isActive }) => isActive ? 'sidebar-link active-link' : 'sidebar-link'}>
            Profile Settings
          </NavLink>
        </li>
        <li>
            <NavLink
                to="/"
                className={({ isActive }) => isActive ? 'sidebar-link active-link active-logout' : 'sidebar-link logout'}
                onClick={()=>{logout();}}>
            Logout
            </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default RetailerProfileSidebar;
