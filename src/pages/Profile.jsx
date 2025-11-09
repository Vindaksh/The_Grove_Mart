// src/pages/Profile.jsx
import  Supabase from '../utils/Database'; // ✅ fix: lowercase name
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './Profile.css'; // optional styling file

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // fetch user info on mount
    const getUser = async () => {
      const { data } = await Supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await Supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="profile-container">
      {/* LEFT SIDEBAR */}
      <aside className="profile-sidebar">
        <h2 className="sidebar-title">Your Profile</h2>
        <ul className="sidebar-links">
          <li><button onClick={() => navigate('/cart')}>Cart</button></li>
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="profile-main">
        {user ? (
          <>
            <p>Welcome, <strong>{user.user_metadata.full_name || user.email}</strong>!</p>
            <img 
              src={user.user_metadata.avatar_url || "https://via.placeholder.com/100"} 
              alt="Avatar" 
              className="profile-avatar"
            />
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </main>
    </div>
  );
}

export default Profile;
