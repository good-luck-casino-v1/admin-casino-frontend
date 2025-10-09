// AdminDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaLock, FaTicketAlt, FaSignOutAlt, FaEye, FaEdit, FaCheck, FaTimes, FaUserPlus, FaEyeSlash, FaHome, FaUsers, FaUserTie, FaGamepad, FaExchangeAlt, FaShieldAlt, FaCreditCard } from 'react-icons/fa'; // Added FaCreditCard
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
// Import tab components
import DashboardTab from './Dashboard';
import UserManagementTab from './UserManagement';
import AgentManagementTab from './AgentManagement';
import GameManagementTab from './GameManagement';
import TransactionsTab from './Transactions';
import SecurityTab from './Security';
import PaymentGatewayTab from './PaymentGateway'; // Import PaymentGatewayTab
// Import Add Admin Modal
import AddAdminModal from './AddAdminModal';

const AdminDashboard = () => {
  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem('adminData')) || {};
  const [admin, setAdmin] = useState(adminData);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [ticketCount, setTicketCount] = useState(0);
  const [tickets, setTickets] = useState([]);
  
  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Form states
  const [editProfile, setEditProfile] = useState({ ...admin });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile photo state
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  
  // Check admin type
  const isSuperAdmin = admin.admin_type === 'super admin';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch ticket count on component mount
  useEffect(() => {
    fetchTicketCount();
    fetchTickets();
  }, []);

  useEffect(() => {
  return () => {
    if (previewPhoto) URL.revokeObjectURL(previewPhoto);
  };
}, [previewPhoto]);

  
  const fetchTicketCount = async () => {
    try {
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tickets/count`);
      setTicketCount(response.data.count);
    } catch (error) {
      console.error('Error fetching ticket count:', error);
    }
  };
  
  const fetchTickets = async () => {
    try {
     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tickets`);
      // Fix: Use response.data directly instead of response.data.tic
      setTickets(response.data || []); // Add fallback to empty array
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]); // Set to empty array on error
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };
  
const handleUpdateProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('name', editProfile.name);
    formData.append('mobile', editProfile.mobile);
    formData.append('email', editProfile.email);
    if (profilePhoto) formData.append('photo', profilePhoto);

    const token = localStorage.getItem('token');
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/update`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


    setAdmin(response.data.admin);
    localStorage.setItem('adminData', JSON.stringify(response.data.admin));
    setShowEditProfileModal(false);
    toast.success('Profile updated successfully!');

    // Refresh immediately
    setTimeout(() => window.location.reload(), 1500);
  } catch (error) {
    console.error('Profile update failed:', error);
    toast.error('Failed to update profile');
  }
};


  
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
        if (!token) {
      toast.error('You are not logged in. Please log in again.');
      return;
    }
      // Include the admin's email in the request
      const passwordRequestData = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        email: admin.email
      };
      
      console.log('Sending password change request:', { email: passwordRequestData.email, oldPassword: '***', newPassword: '***' });
      
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/change-password`,passwordRequestData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token
        },
      }
    );
      setShowPasswordModal(false);
      toast.success('Password changed successfully!');
      
      // Reset password form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to change password');
      } else {
        toast.error('Failed to change password');
      }
    }
  };
  
  // Updated handleTicketAction function
  const handleTicketAction = async (ticketId, action) => {
    try {
      // Determine the status based on action
      const status = action === 'accept' ? 'closed' : 'reject';
      
      await axios.put(`${process.env.REACT_APP_API_URL}/api/tickets/${ticketId}/status`,{
        status: status,
        action: action 
      });
      
      // Update ticket in state with the correct status
      const updatedTickets = tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: status } : ticket
      );
      setTickets(updatedTickets);
      
      // Close modals
      setShowTicketDetailModal(false);
      setShowTicketsModal(false);
      
      toast.success(`Ticket ${action}ed successfully!`);
      fetchTicketCount();
    } catch (error) {
      toast.error(`Failed to ${action} ticket`);
    }
  };
  
  // Render the active tab component
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'Dashboard':
        return <DashboardTab admin={admin} />;
      case 'UserManagement':
        return <UserManagementTab />;
      case 'AgentManagement':
        return <AgentManagementTab />;
      case 'GameManagement':
        return <GameManagementTab />;
      case 'Transactions':
        return <TransactionsTab isSuperAdmin={isSuperAdmin} />;
      case 'Security':
        return <SecurityTab />;
      case 'PaymentGateway':
        return <PaymentGatewayTab isSuperAdmin={isSuperAdmin} />;
      default:
        return <DashboardTab admin={admin} />;
    }
  };
  
  // Navigation items with icons
  const navItems = [
    { id: 'Dashboard', icon: <FaHome className="me-2" />, label: 'Dashboard' },
    { id: 'UserManagement', icon: <FaUsers className="me-2" />, label: 'User Management' },
    { id: 'AgentManagement', icon: <FaUserTie className="me-2" />, label: 'Agent Management' },
    { id: 'GameManagement', icon: <FaGamepad className="me-2" />, label: 'Game Management' },
    { id: 'PaymentGateway', icon: <FaCreditCard className="me-2" />, label: 'Payment Gateway' },
    { id: 'Transactions', icon: <FaExchangeAlt className="me-2" />, label: 'Transactions' },
    { id: 'Security', icon: <FaShieldAlt className="me-2" />, label: 'Security' }
     // Added Payment Gateway
  ];
  
  // Mobile navigation items with icons
  const mobileNavItems = [
    { id: 'Dashboard', icon: <FaHome />, label: 'Dashboard' },
    { id: 'UserManagement', icon: <FaUsers />, label: 'Users' },
    { id: 'AgentManagement', icon: <FaUserTie />, label: 'Agents' },
    { id: 'GameManagement', icon: <FaGamepad />, label: 'Games' },
     { id: 'PaymentGateway', icon: <FaCreditCard />, label: 'Payment' },
    { id: 'Transactions', icon: <FaExchangeAlt />, label: 'Trans' },
    { id: 'Security', icon: <FaShieldAlt />, label: 'Security' }
    // Added Payment Gateway
  ];
  
return (
  <div className="min-vh-100 bg-dark text-white">
    {/* Admin Navbar - Fixed */}
    <nav className="navbar navbar-expand-lg navbar-dark bg-success fixed-top">
      <div className="container-fluid d-flex justify-content-between align-items-center px-3">
        
        {/* Left side - Logo + Brand Name */}
        <div className="d-flex align-items-center">
          <img
            src="/images/goodluck-logo.png"
            alt="GoodLuck Casino"
            height="35"
            className="me-2 rounded-circle"
          />
          <span
            className="navbar-brand fw-bold"
            style={{ color: "#FFD700", fontSize: "1rem" }}
          >
            GOODLUCK CASINO
          </span>
        </div>
          
          {/* Custom Dropdown */}
          <div className="dropdown me-3" ref={dropdownRef}>
            <button 
              className="btn btn-light d-flex align-items-center" 
              type="button" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {admin.photo ? (
              <img
                src={
                  admin.photo
                    ? admin.photo.startsWith('http')
                      ? admin.photo
                      : `${process.env.REACT_APP_SPACES_CDN}/admin/${admin.photo}`
                    : '/images/default-user.png'
                }
                alt="Admin"
                className="rounded-circle me-2"
                width="30"
                height="30"
              />

              ) : (
                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style={{ width: '30px', height: '30px' }}>
                  <FaUser />
                </div>
              )}
              {admin.name}
            </button>
            
            {showDropdown && (
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark show" style={{ zIndex: 1050 }}>
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <FaUser className="me-2" /> Profile
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      setShowPasswordModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <FaLock className="me-2" /> Change Password
                  </button>
                </li>
                {isSuperAdmin && (
                  <li>
                    <button 
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => {
                        setShowAddAdminModal(true);
                        setShowDropdown(false);
                      }}
                    >
                      <FaUserPlus className="me-2" /> Add Admin
                    </button>
                  </li>
                )}
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      setShowTicketsModal(true);
                      setShowDropdown(false);
                      
                    }}
                  >
                    <FaTicketAlt className="me-2" /> Tickets
                    {ticketCount > 0 && (
                      <span className="badge bg-success ms-2">{ticketCount}</span>
                    )}
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center text-danger"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
      
      {/* Secondary Navigation and Content Area */}
      <div className="container-fluid" style={{ marginTop: '56px' }}>
        <div className="row">
          {/* Vertical Navigation - Desktop (Fixed) */}
          <div className="col-12 col-md-2 d-none d-md-block bg-success p-0 fixed-top" style={{ top: '56px', height: 'calc(100vh - 56px)', zIndex: 1040 }}>
            <div className="d-flex flex-column h-100 overflow-y-auto">
              {navItems.map((item, index) => (
                <div key={item.id} className="d-flex flex-column">
                  <button
                    className={`nav-link text-start text-white d-flex align-items-center py-3 ${activeTab === item.id ? 'text-success fw-bold' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    style={{ borderRadius: '0' }}
                  >
                    {item.icon}
                    <span className="fs-6">{item.label}</span>
                  </button>
                  {index < navItems.length - 1 && (
                    <div className="border-bottom border-white border-opacity-25 mx-3"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Content Area (80% width on desktop, 100% on mobile) */}
          <div className="col-12 col-md-10 p-3 pb-5 ms-auto" style={{ marginLeft: '16.666667%' }}>
            {renderActiveTab()}
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation - Updated with smaller icons and text */}
      <nav className="navbar fixed-bottom navbar-dark bg-success d-md-none py-1" style={{ height: '50px' }}>
        <div className="container-fluid h-100">
          <div className="d-flex justify-content-around h-100 align-items-center">
            {mobileNavItems.map((item) => (
              <button
                key={item.id}
                className={`btn btn-link text-white p-0 d-flex flex-column align-items-center justify-content-center h-100 ${activeTab === item.id ? 'text-success' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ 
                  fontSize: '0.5rem', 
                  textDecoration: 'none', 
                  minWidth: '50px',
                  maxWidth: '70px',
                  flex: 1
                }}
              >
                <span style={{ fontSize: '0.8rem' }}>{item.icon}</span>
                <span className="mt-1" style={{ fontSize: '0.5rem', lineHeight: '1' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header bg-success">
                <h5 className="modal-title">Admin Profile</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
               {admin.photo ? (
                <img
                  src={
                    admin.photo.startsWith('http')
                      ? admin.photo
                      : `${process.env.REACT_APP_SPACES_CDN}/admin/${admin.photo}`
                  }
                  alt="Admin"
                  className="rounded-circle mb-3"
                  width="100"
                  height="100"
                  style={{ objectFit: 'cover', border: '2px solid #28a745' }}
                  onError={(e) => {
                    e.target.src = '/images/default-user.png';
                  }}
                />
              ) : (
                <div
                  className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '100px', height: '100px' }}
                >
                  <FaUser size={40} />
                </div>
              )}

                <h4>{admin.name}</h4>
                <p className="text-warning">{admin.admin_type}</p>
                <p><strong>Mobile:</strong> {admin.mobile || 'Not provided'}</p>
                <p><strong>Email:</strong> {admin.email}</p>
              </div>
              <div className="modal-footer bg-success">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-light"
                  onClick={() => {
                    setShowEditProfileModal(true);
                    setShowProfileModal(false);
                  }}
                >
                  <FaEdit className="me-2" /> Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
    {/* ✅ Edit Profile Modal */}
{showEditProfileModal && (
  <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content bg-dark text-white">
        <div className="modal-header bg-success">
          <h5 className="modal-title">Edit Profile</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white"
            onClick={() => setShowEditProfileModal(false)}
          ></button>
        </div>

        <div className="modal-body text-center">
          {/* ✅ Fixed image preview logic */}
{previewPhoto ? (
  // 🟢 Show selected new photo instantly
  <img
    src={previewPhoto}
    alt="Preview"
    className="rounded-circle mb-3"
    width="100"
    height="100"
    style={{ objectFit: 'cover', border: '2px solid #28a745' }}
  />
) : admin.photo ? (
  // 🟢 Show existing photo from S3 or default
  <img
    src={
      admin.photo.startsWith('http')
        ? admin.photo
        : `${process.env.REACT_APP_SPACES_CDN}/admin/${admin.photo}`
    }
    alt="Admin"
    className="rounded-circle mb-3"
    width="100"
    height="100"
    style={{ objectFit: 'cover', border: '2px solid #28a745' }}
    onError={(e) => {
      e.target.src = '/images/default-user.png';
    }}
  />
) : (
  // 🟢 Fallback - no photo yet
  <div
    className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
    style={{ width: '100px', height: '100px' }}
  >
    <FaUser size={40} />
  </div>
)}


          {/* 🟢 File input for new photo */}
          <div className="mt-2 mb-4">
            <label className="btn btn-sm btn-outline-light">
              Change Photo
            <input
  type="file"
  accept="image/*"
  className="d-none"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);

      // ✅ Create preview URL and store it separately
      const previewUrl = URL.createObjectURL(file);
      setPreviewPhoto(previewUrl);
    }
  }}
/>


            </label>
          </div>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control bg-secondary text-white"
              value={editProfile.name}
              onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mobile</label>
            <input
              type="text"
              className="form-control bg-secondary text-white"
              value={editProfile.mobile || ''}
              onChange={(e) => setEditProfile({ ...editProfile, mobile: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control bg-secondary text-white"
              value={editProfile.email}
              onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer bg-success">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowEditProfileModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={handleUpdateProfile}
          >
            <FaEdit className="me-2" /> Modify
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header bg-success">
                <h5 className="modal-title">Change Password</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Old Password</label>
                  <div className="input-group">
                    <input 
                      type={showOldPassword ? "text" : "password"} 
                      className="form-control bg-secondary text-white" 
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <div className="input-group">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      className="form-control bg-secondary text-white" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-group">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="form-control bg-secondary text-white" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-success">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-light"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tickets Modal */}
      {showTicketsModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header bg-success">
                <h5 className="modal-title">Support Tickets</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowTicketsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td>{ticket.id}</td>
                          <td>{ticket.subject}</td>
                          <td>{ticket.message.substring(0, 50)}...</td>
                          <td>
                            <span className={`badge ${ticket.status === 'open' ? 'bg-warning' : ticket.status === 'reject' ? 'bg-danger' : 'bg-success'}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketDetailModal(true);
                              }}
                            >
                              <FaEye /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer bg-success">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTicketsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ticket Detail Modal */}
      {showTicketDetailModal && selectedTicket && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header bg-success">
                <h5 className="modal-title">Ticket Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowTicketDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>User ID:</strong> {selectedTicket.user_id}</p>
                    <p><strong>Ticket ID:</strong> {selectedTicket.id}</p>
                    <p><strong>Subject:</strong> {selectedTicket.subject}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Email:</strong> {selectedTicket.email}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${selectedTicket.status === 'open' ? 'bg-warning' : selectedTicket.status === 'reject' ? 'bg-danger' : 'bg-success'}`}>
                        {selectedTicket.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6>Message:</h6>
                  <p>{selectedTicket.message}</p>
                </div>
                
              {selectedTicket.evidence_url && (
              <div className="mb-3">
                <h6>Evidence:</h6>
                <img
                  src={selectedTicket.evidence_url}
                  alt="Evidence"
                  className="img-fluid rounded border border-success"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/no-image.png';
                  }}
                />
              </div>
            )}
            </div>
              
              {/* Modal Footer with Action Buttons */}
              {selectedTicket.status === 'open' && (
                <div className="modal-footer bg-success">
                  <button 
                    className="btn btn-success me-2"
                    onClick={() => handleTicketAction(selectedTicket.id, 'accept')}
                  >
                    <FaCheck className="me-2" /> Accept
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleTicketAction(selectedTicket.id, 'reject')}
                  >
                    <FaTimes className="me-2" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Add Admin Modal */}
      <AddAdminModal 
        show={showAddAdminModal} 
        onClose={() => setShowAddAdminModal(false)} 
      />
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminDashboard;

