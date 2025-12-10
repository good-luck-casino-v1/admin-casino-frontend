import React, { useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

const AddAdminModal = ({ show, onClose, refreshAdminList }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
   try {
  await axios.post(`${process.env.REACT_APP_API_URL}/api/adminadd/add`,
    formData
  );
      alert('Admin added successfully!');
      setFormData({ name: '', mobile: '', email: '', password: '' }); // Reset form
      onClose();
      if (refreshAdminList) refreshAdminList(); // Refresh admin list if provided
    } catch (error) {
      console.error('Error adding admin:', error);
      if (error.response && error.response.status === 409) {
        alert('Admin with this email already exists');
      } else {
        alert('Failed to add admin');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header bg-success">
            <h5 className="modal-title"><FaUserPlus className="me-2" /> Add Admin</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className={`form-control bg-secondary text-white ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Mobile</label>
                <input 
                  type="text" 
                  className={`form-control bg-secondary text-white ${errors.mobile ? 'is-invalid' : ''}`}
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
                {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className={`form-control bg-secondary text-white ${errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className={`form-control bg-secondary text-white ${errors.password ? 'is-invalid' : ''}`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-footer bg-success">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;