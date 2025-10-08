import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/login`,{ email, password });

       if (response.data.success) {
        toast.success('Login successful!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
   try {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/forgot-password`,{ email: forgotEmail });
      
      if (response.data.success) {
        toast.success('Password reset link sent to your email!');
        setShowForgotModal(false);
        setForgotEmail('');
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center p-4">
      <div className="w-80" style={{ marginLeft: '10%', marginRight: '10%', height: '80%', marginTop: '5%' }}>
        <div className="row h-100 bg-dark rounded overflow-hidden shadow-lg">
          {/* Image Column */}
          <div className="col-md-6 p-0">
            <img 
              src="/images/casino-bg.jpg" 
              alt="Casino" 
              className="w-100 h-100 object-fit-cover" 
            />
          </div>
          
          {/* Form Column */}
          <div className="col-md-6 d-flex flex-column align-items-center justify-content-center p-5">
            <div className="mb-4">
              <img src="/images/goodluck-logo.png" alt="GoodLuck Casino" height="80" />
            </div>
            
            <h1 className="mb-4 fw-bold" style={{ 
              background: 'linear-gradient(to right, #28a745, #ffc107)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              Admin Login
            </h1>
            
            <form onSubmit={handleLogin} className="w-100">
              <div className="mb-3 d-flex justify-content-center">
                <div className="input-group w-80">
                  <span className="input-group-text bg-secondary border-secondary text-white">
                    <FaUser />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-white border-secondary text-secondary text-center"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4 d-flex justify-content-center">
                <div className="input-group w-80">
                  <span className="input-group-text bg-secondary border-secondary text-white">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-white border-secondary text-secondary text-center"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary "
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="d-flex justify-content-center mb-4">
                <button 
                  type="submit" 
                  className="btn w-80 fw-bold"
                  style={{ 
                    background: 'linear-gradient(to right, #28a745, #ffc107)',
                    border: 'none',
                    color: '#212529'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
              
              <div className="text-center">
                <button 
                  type="button" 
                  className="btn btn-success text-white"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Forgot Password</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowForgotModal(false)}
                ></button>
              </div>
              <div className="modal-body bg-dark text-white">
                <p className="text-center mb-4">Enter your email to receive a password reset link</p>
                <div className="d-flex justify-content-center">
                  <div className="input-group w-80">
                    <span className="input-group-text bg-secondary border-secondary text-white">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-secondary border-secondary text-white text-center"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-success">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success text-white"
                  onClick={handleForgotPassword}
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminLogin;