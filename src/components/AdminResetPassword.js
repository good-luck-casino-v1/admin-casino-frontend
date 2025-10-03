import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminResetPassword.css';

const AdminResetPassword = () => {
  const location = useLocation();
  const history = useHistory();

  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!newPassword || !confirmPassword) {
    toast.error("Please fill all fields");
    return;
  }
  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }
  if (newPassword.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }

  try {
    const res = await adminAPI.resetPassword({ token, newPassword });

    if (res.data.success) {
      //  Show success message
      alert("Password reset successful! Please login.");

      //  Redirect to login page
      history.push('/');
    } else {
      toast.error(res.data.message || "Reset failed");
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Server error");
  }
};

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Reset Admin Password</h2>
        <form onSubmit={handleSubmit}>
          
          {/* New Password Field */}
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control reset-input mb-3"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span 
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className="password-input">
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control reset-input mb-3"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span 
              className="toggle-eye"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="btn reset-btn w-100">Reset Password</button>
        </form>
        <div className="reset-footer">
          Back to <a href="/" style={{ color: '#28a745' }}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
