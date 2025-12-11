  import React, { useState, useEffect, useCallback } from 'react';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { 
    faUserPlus, faUser, faEnvelope, faPhone, 
    faCalendar, faLock, faWallet, faSearch, 
    faEye, faMoneyBillWave, faRedo,
    faChevronLeft, faChevronRight, faCheck, faTimes,
    faIdCard, faPlus, faMinus, faTicketAlt, faFileAlt, faList
  } from '@fortawesome/free-solid-svg-icons';
  import { Modal, Button, Form, Alert, Table, Badge, Spinner, Nav, Row, Col } from 'react-bootstrap';
  import axios from 'axios';
  import '../App.css';

  const UserManagement = () => {
    // State declarations
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
    const [filters, setFilters] = useState({ role: '', status: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewData, setViewData] = useState({});
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      mobile: '',
      dob: '',
      password: '',
      wallet_balance: ''
    });
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // View modal state
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    
    // Transactions pagination state
    const [transactionsPage, setTransactionsPage] = useState(1);
    const transactionsPerPage = 10;
    
    // Deposit/Withdraw state
    const [depositWithdrawAmount, setDepositWithdrawAmount] = useState('');
    
    // Fetch users from API
    const fetchUsers = useCallback(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`,{
          params: filters
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setAlert({ show: true, message: 'Error fetching users', variant: 'danger' });
        setLoading(false);
      }
    }, [filters]);
    
    // Fetch user count from API
    const fetchUserCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/count`);
        setUserCount(response.data.count);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };
    
    // Apply search and filters
    const applyFiltersAndSearch = useCallback(() => {
      let result = [...users];
      
      // Apply search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(user => 
          user.id.toString().includes(term) ||
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.mobile && user.mobile.toLowerCase().includes(term))
        );
      }
      
      setFilteredUsers(result);
      setCurrentPage(1);
    }, [users, searchTerm]);

    // Fetch users and count on component mount and when filters/search change
    useEffect(() => {
      fetchUsers();
      fetchUserCount();
    }, [fetchUsers]);
    
    // Apply search and filters whenever users or searchTerm changes
    useEffect(() => {
      applyFiltersAndSearch();
    }, [applyFiltersAndSearch]);
    
    // Handle form input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
    
    // Handle filter changes
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters({ ...filters, [name]: value });
    };
    
    // Handle search input
    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
    };
    
    // Submit new user form
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/users`,formData);
        setAlert({ show: true, message: `User created with ${formData.name}`, variant: 'success' });
        setShowModal(false);
        fetchUsers();
        fetchUserCount();
        setFormData({
          name: '',
          email: '',
          mobile: '',
          dob: '',
          password: '',
          wallet_balance: ''
        });
      } catch (error) {
        setAlert({ show: true, message: 'Error creating user', variant: 'danger' });
        console.error('Error creating user:', error);
      }
    };
    
    // Fetch data for selected column view
    const fetchViewData = async (userId, columnType) => {
      try {
        let endpoint = '';
        switch (columnType) {
          case 'details':
          endpoint = `${process.env.REACT_APP_API_URL}/api/users/${userId}/details`;
            break;
          case 'completedTransactions':
            endpoint = `${process.env.REACT_APP_API_URL}/api/users/${userId}/transactions/completed`;
            break;
          case 'tickets':
            endpoint = `${process.env.REACT_APP_API_URL}/api/users/${userId}/tickets`;
            break;
          case 'pendingTransactions':
            endpoint = `${process.env.REACT_APP_API_URL}/api/users/${userId}/transactions/pending`;
            break;
          default:
            return;
        }
        
        const response = await axios.get(endpoint);
        setViewData(prev => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            [columnType]: response.data
          }
        }));
      } catch (error) {
        console.error('Error fetching view data:', error);
      }
    };
    
    // Reset filters and search
    const resetFilters = () => {
      setFilters({ role: '', status: '' });
      setSearchTerm('');
    };
    
    // Open view modal for a user
    const openViewModal = (user) => {
      setCurrentUser(user);
      setActiveTab('details');
      setShowViewModal(true);
      
      // Fetch all view data for this user
      fetchViewData(user.id, 'details');
      fetchViewData(user.id, 'completedTransactions');
      fetchViewData(user.id, 'tickets');
      fetchViewData(user.id, 'pendingTransactions');
    };
    
    // Handle ticket status update
    const handleTicketStatusUpdate = async (ticketId, status) => {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/users/tickets/${ticketId}/status`, {ticketId, status });
        setAlert({ show: true, message: `Ticket ${status} successfully`, variant: 'success' });
        
        // Refresh tickets data for the current user
        if (currentUser) {
          fetchViewData(currentUser.id, 'tickets');
        }
      } catch (error) {
        console.error('Error updating ticket status:', error);
        setAlert({ show: true, message: 'Error updating ticket status', variant: 'danger' });
      }
    };
    
    // Handle transaction status update
const handleTransactionStatusUpdate = async (tx, status) => {
  try {
    // Normalize values
    const method = (tx.payment_method || "").toLowerCase();
    const type = (tx.type || "").toLowerCase();

    // 1️⃣ Update transaction status (completed/rejected)
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/transactions/${tx.id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const msg = response?.data?.message || "Transaction processed";

    setAlert({
      show: true,
      message: msg,
      variant: response?.data?.success ? "success" : "danger",
    });

    // ❌ If rejected → stop here
    if (status === "rejected") return;

    // ===================================================
    // 2️⃣ COMPLETED — CHECK TYPE
    // ===================================================

    // 🟢 CASE A: BANK DEPOSIT
    if (status === "completed" && type === "deposit" && method.includes("bank")) {
      console.log("✔ BANK DEPOSIT completed — wallet credited via backend");
      await refreshViews();
      return;
    }

    // 🟢 CASE B: BANK WITHDRAW
    if (status === "completed" && type === "withdraw" && method.includes("bank")) {
      console.log("✔ BANK WITHDRAW completed — wallet debited via backend");
      await refreshViews();
      return;
    }

    // 🟢 CASE C: GATEWAY WITHDRAW (TopPay / CloudPay)
    if (status === "completed" && type === "withdraw") {
      const payoutURL =
        method === "toppay"
          ? `${process.env.REACT_APP_API_URL}/api/transactions/admin-payout-toppay`
          : `${process.env.REACT_APP_API_URL}/api/transactions/admin-payout`;

      const payoutData = {
        transaction_id: tx.transaction_id,
        amount: tx.amount,
        userId: tx.user_id,
        payment_method: method,
        bank_code: tx.bank_code || "",
        ifsc_code: tx.ifsc_code || "",
        acc_no: tx.account_number || "",
        account_name: tx.account_name || "User",
        upi_id: tx.upi_id || "",
      };

      console.log(`🚀 Sending payout to: ${payoutURL}`, payoutData);

      const payoutRes = await axios.post(
        payoutURL,
        payoutData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      console.log("Payout Sent:", payoutRes.data);

      setAlert({
        show: true,
        message: payoutRes.data.message || "Payout triggered successfully!",
        variant: payoutRes.data.success ? "success" : "danger",
      });
    }

    // ===================================================
    // 3️⃣ Refresh dashboard after action
    // ===================================================
    await refreshViews();

  } catch (error) {
    console.error("Status update error:", error);
    setAlert({
      show: true,
      message: error.response?.data?.message || "Server error",
      variant: "danger",
    });
  }

  // Helper: Refresh all user views
  async function refreshViews() {
    if (!currentUser) return;
    await fetchViewData(currentUser.id, "pendingTransactions").catch(() => {});
    await fetchViewData(currentUser.id, "details").catch(() => {});
    await fetchViewData(currentUser.id, "completedTransactions").catch(() => {});

    setTimeout(() => setAlert({ show: false }), 4000);
  }
};




    // Handle user status update with modal close and page reload
    const handleUserStatusUpdateAndClose = async (userId, status) => {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/status`, { status });
        setAlert({ show: true, message: `User status updated to ${status}`, variant: 'success' });
        setShowViewModal(false);
        
        // Reload the page after a short delay to show the alert
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error updating user status:', error);
        setAlert({ show: true, message: 'Error updating user status', variant: 'danger' });
      }
    };
    
    // Handle deposit/withdraw
    const handleDepositWithdraw = async (type) => {
      if (!depositWithdrawAmount || isNaN(depositWithdrawAmount) || parseFloat(depositWithdrawAmount) <= 0) {
        setAlert({ show: true, message: 'Please enter a valid amount', variant: 'danger' });
        return;
      }

      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${currentUser.id}/wallet`, {
          type,
          amount: parseFloat(depositWithdrawAmount)
        });

        setAlert({ show: true, message: `${type} successful`, variant: 'success' });
        
        // Reset the amount input
        setDepositWithdrawAmount('');
        
        // Refresh the user details and transactions
        fetchViewData(currentUser.id, 'details');
        fetchViewData(currentUser.id, 'completedTransactions');
      } catch (error) {
        setAlert({ show: true, message: `Error during ${type}`, variant: 'danger' });
        console.error('Error during deposit/withdraw:', error);
      }
    };
    
    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    // Transactions pagination calculations
    const indexOfLastTransaction = transactionsPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    
    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const paginateTransactions = (pageNumber) => setTransactionsPage(pageNumber);
    
    return (
      <div className="container-fluid p-4" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', minHeight: '100vh' }}>
        {/* Custom styles for mobile responsiveness */}
        <style jsx>{`
          @media (max-width: 768px) {
            .mobile-table {
              font-size: 0.75rem;
            }
            .mobile-table th, .mobile-table td {
              padding: 0.4rem 0.3rem;
            }
            .mobile-table .btn-sm {
              padding: 0.2rem 0.4rem;
              font-size: 0.7rem;
            }
            .mobile-table .dropdown-toggle {
              font-size: 0.7rem;
              padding: 0.2rem 0.4rem;
            }
            .mobile-table .badge {
              font-size: 0.65rem;
            }
            .mobile-detail-table {
              font-size: 0.7rem;
            }
            .mobile-detail-table th, .mobile-detail-table td {
              padding: 0.3rem 0.2rem;
            }
            
            /* Enhanced mobile nav-tabs styling */
            .nav-tabs {
              display: flex;
              flex-wrap: nowrap;
              overflow-x: auto;
              white-space: nowrap;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none; /* Firefox */
              border-bottom: 1px solid #444;
              margin-bottom: 1rem;
            }
            
            .nav-tabs::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Edge */
            }
            
            .nav-tabs .nav-item {
              margin-bottom: -1px;
              flex: 0 0 auto;
            }
            
            .nav-tabs .nav-link {
              padding: 0.4rem 0.6rem;
              font-size: 0.75rem;
              color: #aaa;
              border: 1px solid transparent;
              border-top-left-radius: 0.25rem;
              border-top-right-radius: 0.25rem;
              margin-right: 0.2rem;
              text-align: center;
              min-width: 80px;
            }
            
            .nav-tabs .nav-link:hover {
              border-color: #444 #444 transparent;
              color: #fff;
              background-color: rgba(255, 255, 255, 0.05);
            }
            
            .nav-tabs .nav-link.active {
              color: #ffc107;
              background-color: transparent;
              border-color: #ffc107 #ffc107 transparent;
              font-weight: 500;
            }
            
            /* Mobile modal adjustments */
            .modal-dialog {
              margin: 0.5rem;
              max-width: calc(100% - 1rem);
            }
            
            .modal-content {
              border-radius: 0.5rem;
            }
            
            .modal-header {
              border-bottom: 1px solid #444;
              padding: 0.75rem;
            }
            
            .modal-body {
              padding: 1rem;
            }
          }
        `}</style>
        
        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible>
            {alert.message}
          </Alert>
        )}
        
        {/* Title with gradient color */}
        <h1 className="text-center mb-4" style={{ 
          background: 'linear-gradient(to right, #28a745, #ffc107)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          User Management
        </h1>
        
        {/* Add User Button and User Count */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <Button 
            variant="success" 
            className="d-flex align-items-center mb-2 mb-md-0"
            style={{ background: 'linear-gradient(45deg, #28a745, #ffc107)', border: 'none', color: '#ffffff' }}
            onClick={() => setShowModal(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            <span className="d-none d-sm-inline">Add User</span>
          </Button>
          <Button variant="outline-light">
            Total Users: {userCount}
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="row mb-4 g-2">
          <div className="col-12 col-md-8 mb-3 mb-md-0">
            <div className="d-flex flex-wrap gap-2">
              <div className="flex-grow-1" style={{ minWidth: '120px' }}>
                <Form.Select name="role" value={filters.role} onChange={handleFilterChange} className="w-100">
                  <option value="">All Roles</option>
                  <option value="Player">Player</option>
                  <option value="Prime Player">Prime Player</option>
                </Form.Select>
              </div>
              <div className="flex-grow-1" style={{ minWidth: '120px' }}>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange} className="w-100">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </div>
              <Button variant="warning" onClick={resetFilters} className="mb-2 mb-md-0">
                <FontAwesomeIcon icon={faRedo} /> <span className="d-none d-sm-inline">Reset</span>
              </Button>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="input-group w-100">
              <span className="input-group-text bg-dark text-light">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <Form.Control
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-dark text-light"
              />
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
              <p className="mt-2 text-warning">Loading users...</p>
            </div>
          ) : (
            <>
              <Table striped bordered hover variant="dark" className="mobile-table">
                <thead>
                  <tr>
                    <th className="d-none d-md-table-cell">ID</th>
                    <th>Name</th>
                    <th className="d-none d-sm-table-cell">Email</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? currentItems.map(user => (
                    <tr key={user.id}>
                      <td className="d-none d-md-table-cell">{user.id}</td>
                      <td>{user.name}</td>
                      <td className="d-none d-sm-table-cell">{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>
                        <Badge bg={user.status === 'Active' ? 'success' : 'danger'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openViewModal(user)}
                        >
                          <FontAwesomeIcon icon={faEye} /> <span className="d-none d-sm-inline">View</span>
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {/* Pagination Controls */}
              {filteredUsers.length > itemsPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
                  </div>
                  <div className="d-flex">
                    <Button 
                      variant="outline-light" 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} /> Previous
                    </Button>
                    <Button 
                      variant="outline-light" 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    >
                      Next <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Add User Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered className="bg-dark text-light">
          <Modal.Header closeButton className="bg-success text-light">
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  Mobile
                </Form.Label>
                <Form.Control
                  type="tel"
                  inputMode="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faCalendar} className="me-2" />
                  Date of Birth
                </Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faWallet} className="me-2" />
                  Wallet Balance
                </Form.Label>
                <Form.Control
                  type="number"
                  inputMode="decimal"
                  name="wallet_balance"
                  value={formData.wallet_balance}
                  onChange={handleInputChange}
                  required
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button type="submit" variant="success">
                  Create User
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        
        {/* View User Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" className="bg-dark text-light">
          <Modal.Header closeButton className="bg-success text-light">
            <Modal.Title>
              <FontAwesomeIcon icon={faUser} className="me-2" />
              {currentUser ? `${currentUser.name} (ID: ${currentUser.id})` : 'User Details'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            <Nav variant="tabs" className="mb-3" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="details">Details</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="depositWithdraw">Deposit/Withdraw</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tickets">Tickets</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pendingTransactions">Pending</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completedTransactions">Transactions</Nav.Link>
              </Nav.Item>
            </Nav>
            
            {currentUser && viewData[currentUser.id] && (
              <div>
                {activeTab === 'details' && viewData[currentUser.id].details && (
                  <div className="glass-container">
                    <h5 className="glass-heading">
                      <FontAwesomeIcon icon={faUser} />
                      User Details
                    </h5>
                    <div className="glass-details-card">
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">ID:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.id}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Name:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.name}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Email:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.email}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Mobile:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.mobile}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">DOB:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.dob}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Wallet Balance:</Col>
                          <Col sm={8}>
                            <strong style={{ color: '#2bd98e', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
                              ₹{(parseFloat(viewData[currentUser.id].details.wallet_balance) || 0).toFixed(2)}
                            </strong>
                          </Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Referred By:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.referred_by}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Status:</Col>
                          <Col sm={8}>
                            <Badge className="glass-badge" bg={viewData[currentUser.id].details.status === 'Active' ? 'success' : 'danger'}>
                              {viewData[currentUser.id].details.status}
                            </Badge>
                          </Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">Role:</Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.role}</Col>
                        </Row>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-end mt-4">
                      {viewData[currentUser.id].details.status === 'Active' ? (
                        <Button 
                          variant="danger" 
                          className="glass-btn-status danger"
                          onClick={() => handleUserStatusUpdateAndClose(currentUser.id, 'Suspended')}
                        >
                          Suspend User
                        </Button>
                      ) : (
                        <Button 
                          variant="success" 
                          className="glass-btn-status"
                          onClick={() => handleUserStatusUpdateAndClose(currentUser.id, 'Active')}
                        >
                          Activate User
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'depositWithdraw' && viewData[currentUser.id].details && (
                  <div className="glass-container">
                    <h5 className="glass-heading">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      Deposit/Withdraw
                    </h5>
                    <div className="glass-details-card">
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">
                            <FontAwesomeIcon icon={faIdCard} className="me-2" /> ID:
                          </Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.id}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">
                            <FontAwesomeIcon icon={faUser} className="me-2" /> Name:
                          </Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.name}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" /> Email:
                          </Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.email}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">
                            <FontAwesomeIcon icon={faPhone} className="me-2" /> Mobile:
                          </Col>
                          <Col sm={8} className="glass-details-value">{viewData[currentUser.id].details.mobile}</Col>
                        </Row>
                      </div>
                      <div className="glass-details-row">
                        <Row>
                          <Col sm={4} className="glass-details-label">
                            <FontAwesomeIcon icon={faWallet} className="me-2" /> Wallet Balance:
                          </Col>
                          <Col sm={8}>
                            <strong style={{ color: '#2bd98e', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
                              ₹{(parseFloat(viewData[currentUser.id].details.wallet_balance) || 0).toFixed(2)}
                            </strong>
                          </Col>
                        </Row>
                      </div>
                    </div>

                    <Form.Group className="mb-3 mt-4">
                      <Form.Label className="glass-details-label">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> Amount
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={depositWithdrawAmount}
                        onChange={(e) => setDepositWithdrawAmount(e.target.value)}
                        className="glass-form-input"
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button 
                        variant="success" 
                        className="glass-btn-deposit"
                        onClick={() => handleDepositWithdraw('deposit')}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Deposit
                      </Button>
                      <Button 
                        variant="danger"
                        className="glass-btn-withdraw"
                        onClick={() => handleDepositWithdraw('withdraw')}
                      >
                        <FontAwesomeIcon icon={faMinus} className="me-1" /> Withdraw
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'tickets' && viewData[currentUser.id].tickets && (
                  <div className="glass-container">
                    <h5 className="glass-heading">
                      <FontAwesomeIcon icon={faTicketAlt} />
                      Tickets
                    </h5>
                    {viewData[currentUser.id].tickets.filter(t => t.status === 'open').length > 0 ? (
                      <Table striped bordered hover size="sm" variant="dark" className="glass-table mobile-detail-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th className="d-none d-md-table-cell">Message</th>
                            <th className="d-none d-sm-table-cell">Email</th>
                            <th>Evidence</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewData[currentUser.id].tickets
                            .filter(ticket => ticket.status === 'open')
                            .map((ticket) => (
                            <tr key={ticket.id}>
                              <td>
                                <strong style={{ color: '#d1ffe5' }}>{ticket.subject}</strong>
                              </td>
                              <td className="d-none d-md-table-cell">{ticket.message}</td>
                              <td className="d-none d-sm-table-cell">{ticket.email}</td>
                              <td>
                                {ticket.evidence ? (
                                  <a 
                                    href={ticket.evidence_url || `${process.env.REACT_APP_SPACES_CDN}/${ticket.evidence}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={ticket.evidence_url || `${process.env.REACT_APP_SPACES_CDN}/${ticket.evidence}`}
                                      alt="Evidence"
                                      className="glass-image-preview"
                                      style={{ width: "80px", height: "60px", objectFit: "cover" }}
                                    />
                                  </a>
                                ) : (
                                  <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>N/A</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-2 flex-wrap">
                                  <Button 
                                    variant="success" 
                                    size="sm" 
                                    className="glass-btn-accept"
                                    onClick={() => handleTicketStatusUpdate(ticket.id, 'closed')}
                                  >
                                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                                    <span className="d-none d-sm-inline">Accept</span>
                                  </Button>
                                  <Button 
                                    variant="danger" 
                                    size="sm"
                                    className="glass-btn-reject"
                                    onClick={() => handleTicketStatusUpdate(ticket.id, 'rejected')}
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                                    <span className="d-none d-sm-inline">Reject</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="glass-empty-state">
                        <FontAwesomeIcon icon={faTicketAlt} size="3x" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p className="mb-0">No open tickets found</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'pendingTransactions' && viewData[currentUser.id].pendingTransactions && (
                  <div className="pending-withdrawals-container">
                    <h5 className="glass-heading">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      Pending Withdrawals
                    </h5>
                    {viewData[currentUser.id].pendingTransactions.filter(tx => {
                      const type = (tx.type || "").toLowerCase();
                      // ✅ Only show withdrawals - hide all deposits
                      return type === "withdraw" || type === "withdrawal";
                    }).length > 0 ? (
                      <Table striped bordered hover size="sm" variant="dark" className="glass-table mobile-detail-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th className="d-none d-md-table-cell">Payment Method</th>
                            <th className="d-none d-sm-table-cell">UTR</th>
                            <th>Screenshot</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewData[currentUser.id].pendingTransactions
                            .filter(tx => {
                              const type = (tx.type || "").toLowerCase();
                              // ✅ Only show withdrawals - hide all deposits
                              return type === "withdraw" || type === "withdrawal";
                            })
                            .map((tx) => (
                              <tr key={tx.id}>
                                <td>
                                  <Badge className="glass-badge">
                                    {tx.type}
                                  </Badge>
                                </td>
                                <td>
                                  <strong style={{ color: '#2bd98e', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
                                    ₹{parseFloat(tx.amount || 0).toFixed(2)}
                                  </strong>
                                </td>
                                <td className="d-none d-md-table-cell">
                                  <Badge bg="secondary" className="glass-badge">
                                    {tx.payment_method || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="d-none d-sm-table-cell" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                  {tx.utr || 'N/A'}
                                </td>
                                <td>
                                  {tx.screenshot ? (
                                    <a
                                      href={`${process.env.REACT_APP_SPACES_CDN}/${tx.screenshot}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="glass-link"
                                    >
                                      <FontAwesomeIcon icon={faEye} className="me-1" />
                                      View
                                    </a>
                                  ) : (
                                    <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>N/A</span>
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex gap-2 flex-wrap">
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="glass-btn-accept"
                                      onClick={() => handleTransactionStatusUpdate(tx, 'completed')}
                                    >
                                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                                      Accept
                                    </Button>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      className="glass-btn-reject"
                                      onClick={() => handleTransactionStatusUpdate(tx, 'reject')}
                                    >
                                      <FontAwesomeIcon icon={faTimes} className="me-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="glass-empty-state">
                        <FontAwesomeIcon icon={faMoneyBillWave} size="3x" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p className="mb-0">No pending withdrawals found</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'completedTransactions' && viewData[currentUser.id].completedTransactions && (
                  <div className="glass-container">
                    <h5 className="glass-heading">
                      <FontAwesomeIcon icon={faList} />
                      Completed Transactions
                    </h5>
                    {viewData[currentUser.id].completedTransactions.length > 0 ? (
                      <>
                        <Table striped bordered hover size="sm" variant="dark" className="glass-table mobile-detail-table">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Amount</th>
                              <th className="d-none d-md-table-cell">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewData[currentUser.id].completedTransactions
                              .slice(indexOfFirstTransaction, indexOfLastTransaction)
                              .map((tx, index) => (
                              <tr key={index}>
                                <td>
                                  <Badge className="glass-badge">
                                    {tx.type}
                                  </Badge>
                                </td>
                                <td>
                                  <strong style={{ color: '#2bd98e', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
                                    ₹{parseFloat(tx.amount || 0).toFixed(2)}
                                  </strong>
                                </td>
                                <td className="d-none d-md-table-cell">{tx.created_at}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        
                        {/* Transactions Pagination */}
                        {viewData[currentUser.id].completedTransactions.length > transactionsPerPage && (
                          <div className="glass-pagination d-flex justify-content-between align-items-center">
                            <div className="glass-details-value">
                              Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, viewData[currentUser.id].completedTransactions.length)} of {viewData[currentUser.id].completedTransactions.length} entries
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-light" 
                                onClick={() => paginateTransactions(transactionsPage - 1)} 
                                disabled={transactionsPage === 1}
                                className="glass-pagination-btn"
                              >
                                <FontAwesomeIcon icon={faChevronLeft} className="me-1" /> Previous
                              </Button>
                              <Button 
                                variant="outline-light" 
                                onClick={() => paginateTransactions(transactionsPage + 1)} 
                                disabled={transactionsPage === Math.ceil(viewData[currentUser.id].completedTransactions.length / transactionsPerPage)}
                                className="glass-pagination-btn"
                              >
                                Next <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="glass-empty-state">
                        <FontAwesomeIcon icon={faList} size="3x" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p className="mb-0">No completed transactions found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-success">
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  export default UserManagement;