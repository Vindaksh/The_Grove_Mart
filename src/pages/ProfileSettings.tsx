import { useState } from "react";
import { updateName as updateNameDB, updatePassword as updatePasswordDB } from "../utils/Database";
import { useAuth } from "../context/AuthContext";

export const ProfileSettingsPage = () => {
    const { user, reload } = useAuth();

    const [newName, setNewName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const updateName = async () => {
        await updateNameDB(user!, newName);
        await reload();
        setNewName("");
    }

    const updatePassword = async () => {
        await updatePasswordDB(user!, newPassword);
        setCurrentPassword("");
        setNewPassword("");
    }

    return (
        <div className="settings-section">
            <h2 className="section-title">Edit Profile</h2>

            {/* --- NAME UPDATE --- */}
            <div className="settings-card">
                <h3>Update Name</h3>
                <input
                type="text"
                placeholder="Enter new name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={updateName}>Save Name</button>
            </div>

            {/* --- PASSWORD UPDATE --- */}
            <div className="settings-card">
                <h3>Change Password</h3>
                <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={updatePassword}>Change Password</button>
            </div>
        </div>
    )
}