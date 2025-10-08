import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExchangeAlt, faSearch, faFilter, faRedo, 
  faChevronLeft, faChevronRight, faEye, faCheck, 
  faTimes, faMoneyBillWave, faCreditCard, faUser,
  faCalendar, faImage, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Alert, Table, Spinner, Row, Col, Badge, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';

const Transactions = () => {
  // State declarations
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [agentTransactions, setAgentTransactions] = useState([]);
  const [filteredAgentTransactions, setFilteredAgentTransactions] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [agentFilters, setAgentFilters] = useState({ type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAgentTransaction, setSelectedAgentTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('player');
  const [activeSubTab, setActiveSubTab] = useState('pending');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [agentCurrentPage, setAgentCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Fetch transactions and count on component mount and when filters change
  useEffect(() => {
    fetchTransactions();
    fetchTransactionCount();
  }, [filters, activeSubTab]);
  
  // Fetch agent transactions when tab or filters change
  useEffect(() => {
    if (activeTab === 'agent') {
      fetchAgentTransactions();
    }
  }, [activeTab, activeSubTab, agentFilters]);
  
  // Apply search and filters whenever transactions or searchTerm changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [transactions, searchTerm]);
  
  // Apply search and filters for agent transactions
  useEffect(() => {
    applyAgentFiltersAndSearch();
  }, [agentTransactions, agentSearchTerm]);
  
  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions`,{
        params: { ...filters, status: activeSubTab }
      });
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAlert({ show: true, message: 'Error fetching transactions', variant: 'danger' });
      setLoading(false);
    }
  };
  
  // Fetch agent transactions from API
  const fetchAgentTransactions = async () => {
    setAgentLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions/agent`,{
        params: { status: activeSubTab }
      });
      setAgentTransactions(response.data);
      setAgentLoading(false);
    } catch (error) {
      console.error('Error fetching agent transactions:', error);
      setAlert({ show: true, message: 'Error fetching agent transactions', variant: 'danger' });
      setAgentLoading(false);
    }
  };
  
  // Fetch transaction count from API
  const fetchTransactionCount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions/count`);
      setTransactionCount(response.data.count);
    } catch (error) {
      console.error('Error fetching transaction count:', error);
    }
  };
  
  // Apply search and filters
  const applyFiltersAndSearch = () => {
    let result = [...transactions];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(transaction => 
        transaction.id.toString().includes(term) ||
        transaction.user_id.toString().includes(term) ||
        (transaction.transaction_id && transaction.transaction_id.toLowerCase().includes(term)) ||
        (transaction.utr && transaction.utr.toLowerCase().includes(term))
      );
    }
    
    setFilteredTransactions(result);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Apply search and filters for agent transactions
  const applyAgentFiltersAndSearch = () => {
    let result = [...agentTransactions];
    
    // Apply type filter
    if (agentFilters.type) {
      result = result.filter(transaction => transaction.type === agentFilters.type);
    }
    
    // Apply search term
    if (agentSearchTerm) {
      const term = agentSearchTerm.toLowerCase();
      result = result.filter(transaction => 
        transaction.id.toString().includes(term) ||
        transaction.agent_id.toString().includes(term)
      );
    }
    
    setFilteredAgentTransactions(result);
    setAgentCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  // Handle agent filter changes
  const handleAgentFilterChange = (e) => {
    const { name, value } = e.target;
    setAgentFilters({ ...agentFilters, [name]: value });
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle agent search input
  const handleAgentSearch = (e) => {
    setAgentSearchTerm(e.target.value);
  };
  
  // Reset filters and search
  const resetFilters = () => {
    setFilters({ type: '', status: '' });
    setSearchTerm('');
  };
  
  // Reset agent filters and search
  const resetAgentFilters = () => {
    setAgentFilters({ type: '' });
    setAgentSearchTerm('');
  };
  
  // Open view modal for a transaction
  const openViewModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };
  
  // Open view modal for an agent transaction
  const openAgentModal = async (transaction) => {
    setSelectedAgentTransaction(transaction);
    
    // Fetch additional details based on transaction type
    try {
      if (transaction.type === 'deposit') { 
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions/agent/deposit/${transaction.id}`);
        setSelectedAgentTransaction(response.data);
      } else {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions/agent/commission/${transaction.id}`);
        setSelectedAgentTransaction(response.data);
      }
    } catch (error) {
      console.error('Error fetching agent transaction details:', error);
      setAlert({ show: true, message: 'Error fetching transaction details', variant: 'danger' });
    }
    
    setShowAgentModal(true);
  };
  
  // Handle transaction status update
  const handleTransactionStatusUpdate = async (transactionId, status) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/transactions/${transactionId}/status`, { status });
      
      // Prepare the success message
      let message = `Transaction ${status} successfully`;
      if (status === 'completed' && response.data.newBalance !== null) {
        message = `Transaction completed. New wallet balance: ₹${response.data.newBalance}`;
      }
      
      setAlert({ show: true, message, variant: 'success' });
      fetchTransactions(); // Refresh transactions list
      setShowViewModal(false); // Close modal after successful operation
    } catch (error) {
      console.error('Error updating transaction status:', error);
      setAlert({ show: true, message: 'Error updating transaction status', variant: 'danger' });
    }
  };
  
  // Handle agent deposit status update
  const handleAgentDepositStatusUpdate = async (depositId, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/transactions/agent/deposit/${depositId}/status`, { status });
      setAlert({ show: true, message: `Agent deposit ${status} successfully`, variant: 'success' });
      fetchAgentTransactions(); // Refresh agent transactions list
      setShowAgentModal(false); // Close modal after successful operation
    } catch (error) {
      console.error('Error updating agent deposit status:', error);
      setAlert({ show: true, message: 'Error updating agent deposit status', variant: 'danger' });
    }
  };
  
  // Handle commission payment status update (Withdraw)
  const handleCommissionPaymentStatusUpdate = async (paymentId, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/transactions/agent/commission/${paymentId}/status`, { status });
      setAlert({ show: true, message: `Agent withdraw ${status} successfully`, variant: 'success' });
      fetchAgentTransactions(); // Refresh agent transactions list
      setShowAgentModal(false); // Close modal after successful operation
    } catch (error) {
      console.error('Error updating agent withdraw status:', error);
      setAlert({ show: true, message: 'Error updating agent withdraw status', variant: 'danger' });
    }
  };
  
  // Pagination calculations for player transactions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  // Pagination calculations for agent transactions
  const agentIndexOfLastItem = agentCurrentPage * itemsPerPage;
  const agentIndexOfFirstItem = agentIndexOfLastItem - itemsPerPage;
  const currentAgentItems = filteredAgentTransactions.slice(agentIndexOfFirstItem, agentIndexOfLastItem);
  const agentTotalPages = Math.ceil(filteredAgentTransactions.length / itemsPerPage);
  
  // Change page for player transactions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Change page for agent transactions
  const agentPaginate = (pageNumber) => setAgentCurrentPage(pageNumber);
  
  // Format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString();
  };
  
  // Format payment details (JSON) for display
  const formatPaymentDetails = (paymentDetails) => {
    if (!paymentDetails) return 'N/A';
    
    try {
      const details = JSON.parse(paymentDetails);
      return (
        <div>
          {Object.entries(details).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      );
    } catch (e) {
      // If parsing fails, return the raw string
      return paymentDetails;
    }
  };
  
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
          .mobile-table .badge {
            font-size: 0.65rem;
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
        
        .dual-color-title {
          background: linear-gradient(to right, #28a745, #dc3545);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        
        .payment-details-container {
          max-height: 200px;
          overflow-y: auto;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #444;
        }
      `}</style>
      
      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}
      
      {/* Title */}
      <h1 className="text-center mb-4 dual-color-title">Transaction Management</h1>
      
      {/* Transaction Count */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <Button variant="outline-light">
          <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
          Total Transactions: {transactionCount}
        </Button>
      </div>
      
      {/* Main Navigation Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="player" className={activeTab === 'player' ? 'bg-success text-white' : ''}>
              Player
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="agent" className={activeTab === 'agent' ? 'bg-success text-white' : ''}>
              Agent
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          {/* Player Tab */}
          <Tab.Pane eventKey="player">
            {/* Sub Navigation Tabs */}
            <Tab.Container activeKey={activeSubTab} onSelect={(k) => setActiveSubTab(k)}>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="pending" className={activeSubTab === 'pending' ? 'bg-warning text-white' : ''}>
                    Pending
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="completed" className={activeSubTab === 'completed' ? 'bg-warning text-white' : ''}>
                    Completed
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reject" className={activeSubTab === 'reject' ? 'bg-warning text-white' : ''}>
                    Reject
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content>
                {/* Player Transactions Table */}
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="warning" />
                      <p className="mt-2 text-warning">Loading transactions...</p>
                    </div>
                  ) : (
                    <>
                      {/* Filters and Search */}
                      <div className="row mb-4">
                        <div className="col-md-8 mb-3 mb-md-0">
                          <div className="d-flex flex-wrap">
                            <div className="me-2 mb-2 flex-grow-1" style={{ minWidth: '120px' }}>
                              <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">All Types</option>
                                <option value="deposit">Deposit</option>
                                <option value="withdrawal">Withdrawal</option>
                              </Form.Select>
                            </div>
                            <Button variant="warning" onClick={resetFilters} className="mb-2">
                              <FontAwesomeIcon icon={faRedo} /> <span className="d-none d-sm-inline">Reset</span>
                            </Button>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="input-group">
                            <span className="input-group-text bg-dark text-light">
                              <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <Form.Control
                              type="text"
                              placeholder="Search by ID, User ID, Transaction ID or UTR"
                              value={searchTerm}
                              onChange={handleSearch}
                              className="bg-dark text-light"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Table striped bordered hover variant="dark" className="mobile-table">
                        <thead>
                          <tr>
                            <th className="d-none d-md-table-cell">ID</th>
                            <th>User ID</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th className="d-none d-sm-table-cell">Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length > 0 ? currentItems.map(transaction => (
                            <tr key={transaction.id}>
                              <td className="d-none d-md-table-cell">{transaction.id}</td>
                              <td>{transaction.user_id}</td>
                              <td>
                                <Badge bg={transaction.type === 'deposit' ? 'success' : 'danger'}>
                                  {transaction.type}
                                </Badge>
                              </td>
                              <td>₹{transaction.amount}</td>
                              <td className="d-none d-sm-table-cell">{transaction.payment_method || 'N/A'}</td>
                              <td>
                                <Badge bg={
                                  transaction.status === 'completed' ? 'success' : 
                                  transaction.status === 'reject' ? 'danger' : 'warning'
                                }>
                                  {transaction.status}
                                </Badge>
                              </td>
                              <td>
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => openViewModal(transaction)}
                                  className="me-1"
                                >
                                  <FontAwesomeIcon icon={faEye} /> <span className="d-none d-sm-inline">View</span>
                                </Button>
                                {transaction.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="me-1"
                                      onClick={() => handleTransactionStatusUpdate(transaction.id, 'completed')}
                                      title="Mark as Completed"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      onClick={() => handleTransactionStatusUpdate(transaction.id, 'reject')}
                                      title="Mark as Rejected"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="7" className="text-center py-3">
                                No transactions found matching your criteria
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                      
                      {/* Pagination Controls */}
                      {filteredTransactions.length > itemsPerPage && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} entries
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
              </Tab.Content>
            </Tab.Container>
          </Tab.Pane>
          
          {/* Agent Tab */}
          <Tab.Pane eventKey="agent">
            {/* Sub Navigation Tabs */}
            <Tab.Container activeKey={activeSubTab} onSelect={(k) => setActiveSubTab(k)}>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="pending" className={activeSubTab === 'pending' ? 'bg-warning text-white' : ''}>
                    Pending
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="completed" className={activeSubTab === 'completed' ? 'bg-warning text-white' : ''}>
                    Completed
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reject" className={activeSubTab === 'reject' ? 'bg-warning text-white' : ''}>
                    Reject
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content>
                {/* Agent Transactions Table */}
                <div className="table-responsive">
                  {agentLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="warning" />
                      <p className="mt-2 text-warning">Loading agent transactions...</p>
                    </div>
                  ) : (
                    <>
                      {/* Filters and Search */}
                      <div className="row mb-4">
                        <div className="col-md-8 mb-3 mb-md-0">
                          <div className="d-flex flex-wrap">
                            <div className="me-2 mb-2 flex-grow-1" style={{ minWidth: '120px' }}>
                              <Form.Select name="type" value={agentFilters.type} onChange={handleAgentFilterChange}>
                                <option value="">All Types</option>
                                <option value="deposit">Deposit</option>
                                <option value="withdraw">Withdraw</option>
                              </Form.Select>
                            </div>
                            <Button variant="warning" onClick={resetAgentFilters} className="mb-2">
                              <FontAwesomeIcon icon={faRedo} /> <span className="d-none d-sm-inline">Reset</span>
                            </Button>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="input-group">
                            <span className="input-group-text bg-dark text-light">
                              <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <Form.Control
                              type="text"
                              placeholder="Search by ID or Agent ID"
                              value={agentSearchTerm}
                              onChange={handleAgentSearch}
                              className="bg-dark text-light"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Table striped bordered hover variant="dark" className="mobile-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Agent ID</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAgentItems.length > 0 ? currentAgentItems.map((transaction, index) => (
                            <tr key={transaction.id}>
                              <td>{agentIndexOfFirstItem + index + 1}</td>
                              <td>{transaction.agent_id}</td>
                              <td>₹{transaction.amount}</td>
                              <td>
                                <Badge bg={transaction.type === 'deposit' ? 'success' : 'danger'}>
                                  {transaction.type}
                                </Badge>
                              </td>
                              <td>
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => openAgentModal(transaction)}
                                  className="me-1"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Button>
                                {transaction.status && transaction.status.toLowerCase() === 'pending' && transaction.type === 'deposit' && (
                                  <>
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="me-1"
                                      onClick={() => handleAgentDepositStatusUpdate(transaction.id, 'completed')}
                                      title="Accept Deposit"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      onClick={() => handleAgentDepositStatusUpdate(transaction.id, 'reject')}
                                      title="Reject Deposit"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                  </>
                                )}
                                {transaction.status && transaction.status.toLowerCase() === 'pending' && transaction.type === 'withdraw' && (
                                  <>
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="me-1"
                                      onClick={() => handleCommissionPaymentStatusUpdate(transaction.id, 'completed')}
                                      title="Accept Withdraw"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      onClick={() => handleCommissionPaymentStatusUpdate(transaction.id, 'reject')}
                                      title="Reject Withdraw"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="5" className="text-center py-3">
                                No agent transactions found matching your criteria
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                      
                      {/* Pagination Controls */}
                      {filteredAgentTransactions.length > itemsPerPage && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            Showing {agentIndexOfFirstItem + 1} to {Math.min(agentIndexOfLastItem, filteredAgentTransactions.length)} of {filteredAgentTransactions.length} entries
                          </div>
                          <div className="d-flex">
                            <Button 
                              variant="outline-light" 
                              onClick={() => agentPaginate(agentCurrentPage - 1)} 
                              disabled={agentCurrentPage === 1}
                              className="me-2"
                            >
                              <FontAwesomeIcon icon={faChevronLeft} /> Previous
                            </Button>
                            <Button 
                              variant="outline-light" 
                              onClick={() => agentPaginate(agentCurrentPage + 1)} 
                              disabled={agentCurrentPage === agentTotalPages}
                            >
                              Next <FontAwesomeIcon icon={faChevronRight} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Tab.Content>
            </Tab.Container>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      
      {/* View Transaction Modal (Player) */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
            Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedTransaction && (
            <div>
              <h5 className="text-warning">Transaction Information</h5>
              <Row className="mb-2">
                <Col sm={4}><strong>ID:</strong></Col>
                <Col sm={8}>{selectedTransaction.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>User ID:</strong></Col>
                <Col sm={8}>{selectedTransaction.user_id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Type:</strong></Col>
                <Col sm={8}>
                  <Badge bg={selectedTransaction.type === 'deposit' ? 'success' : 'danger'}>
                    {selectedTransaction.type}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Amount:</strong></Col>
                <Col sm={8}>₹{selectedTransaction.amount}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Payment Method:</strong></Col>
                <Col sm={8}>{selectedTransaction.payment_method || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Status:</strong></Col>
                <Col sm={8}>
                  <Badge bg={
                    selectedTransaction.status === 'completed' ? 'success' : 
                    selectedTransaction.status === 'reject' ? 'danger' : 'warning'
                  }>
                    {selectedTransaction.status}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Transaction ID:</strong></Col>
                <Col sm={8}>{selectedTransaction.transaction_id || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>UTR:</strong></Col>
                <Col sm={8}>{selectedTransaction.utr || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Payment Details:</strong></Col>
                <Col sm={8}>
                  <div className="payment-details-container">
                    {formatPaymentDetails(selectedTransaction.payment_details)}
                  </div>
                </Col>
              </Row>
              <Row className="mb-2">
                  <Col sm={4}><strong>Screenshot:</strong></Col>
                  <Col sm={8}>
                    {selectedTransaction.screenshot ? (
                      <a
                        href={selectedTransaction.screenshot_url || `${process.env.REACT_APP_SPACES_CDN}/${selectedTransaction.screenshot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light"
                      >
                        View Screenshot
                      </a>
                    ) : 'No screenshot provided'}
                  </Col>
                </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Created At:</strong></Col>
                <Col sm={8}>{formatDateTime(selectedTransaction.created_at)}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedTransaction && selectedTransaction.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                className="me-2 action-button"
                onClick={() => handleTransactionStatusUpdate(selectedTransaction.id, 'completed')}
              >
                <FontAwesomeIcon icon={faCheck} /> Mark as Completed
              </Button>
              <Button 
                variant="danger"
                className="action-button"
                onClick={() => handleTransactionStatusUpdate(selectedTransaction.id, 'reject')}
              >
                <FontAwesomeIcon icon={faTimes} /> Mark as Rejected
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* View Agent Transaction Modal */}
      <Modal show={showAgentModal} onHide={() => setShowAgentModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
            Agent Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedAgentTransaction && (
            <div>
              <h5 className="text-warning">
                {selectedAgentTransaction.type === 'deposit' ? 'Agent Deposit' : 'Agent Withdraw'} Information
              </h5>
              
              {selectedAgentTransaction.type === 'deposit' ? (
                <>
                  <Row className="mb-2">
                    <Col sm={4}><strong>ID:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.id}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Agent ID:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.agent_id}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Amount:</strong></Col>
                    <Col sm={8}>₹{selectedAgentTransaction.amount}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Status:</strong></Col>
                    <Col sm={8}>
                      <Badge bg={
                        selectedAgentTransaction.status === 'completed' ? 'success' : 
                        selectedAgentTransaction.status === 'reject' ? 'danger' : 'warning'
                      }>
                        {selectedAgentTransaction.status}
                      </Badge>
                    </Col>
                  </Row>
                              <Row className="mb-2">
  <Col sm={4}><strong>Screenshot:</strong></Col>
  <Col sm={8}>
    {selectedAgentTransaction.screenshot ? (
      <a
        href={selectedAgentTransaction.screenshot_url || `${process.env.REACT_APP_SPACES_CDN}/${selectedAgentTransaction.screenshot}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-light"
      >
        View Screenshot
      </a>
    ) : 'No screenshot provided'}
  </Col>
</Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Created At:</strong></Col>
                    <Col sm={8}>{formatDateTime(selectedAgentTransaction.created_at)}</Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row className="mb-2">
                    <Col sm={4}><strong>ID:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.id}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Agent ID:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.agent_id}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Amount:</strong></Col>
                    <Col sm={8}>₹{selectedAgentTransaction.amount}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Status:</strong></Col>
                    <Col sm={8}>
                      <Badge bg={
                        selectedAgentTransaction.status === 'completed' ? 'success' : 
                        selectedAgentTransaction.status === 'reject' ? 'danger' : 'warning'
                      }>
                        {selectedAgentTransaction.status}
                      </Badge>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Payment Date:</strong></Col>
                    <Col sm={8}>{formatDateTime(selectedAgentTransaction.payment_date)}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Account Number:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.account_number || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Account Name:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.account_name || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Bank Name:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.bank_name || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>IFSC:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.ifsc || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={4}><strong>Agent Name:</strong></Col>
                    <Col sm={8}>{selectedAgentTransaction.agent_name || 'N/A'}</Col>
                  </Row>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowAgentModal(false)}>
            Close
          </Button>
          {selectedAgentTransaction && !selectedAgentTransaction.loading && 
           selectedAgentTransaction.status && selectedAgentTransaction.status.toLowerCase() === 'pending' && (
            <>
              {selectedAgentTransaction.type === 'deposit' ? (
                <>
                  <Button 
                    variant="success" 
                    className="me-2 action-button"
                    onClick={() => handleAgentDepositStatusUpdate(selectedAgentTransaction.id, 'completed')}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Accept Deposit
                  </Button>
                  <Button 
                    variant="danger"
                    className="action-button"
                    onClick={() => handleAgentDepositStatusUpdate(selectedAgentTransaction.id, 'reject')}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Reject Deposit
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="success" 
                    className="me-2 action-button"
                    onClick={() => handleCommissionPaymentStatusUpdate(selectedAgentTransaction.id, 'completed')}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Accept Withdraw
                  </Button>
                  <Button 
                    variant="danger"
                    className="action-button"
                    onClick={() => handleCommissionPaymentStatusUpdate(selectedAgentTransaction.id, 'reject')}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Reject Withdraw
                  </Button>
                </>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transactions;