import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaUniversity, FaMobileAlt, FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaRupeeSign, FaLandmark, FaCoins, FaSearch, FaFilter, FaDownload, FaFilePdf } from 'react-icons/fa';
import { Modal, Button, Form, Alert, Table, Badge, Spinner, Nav, Row, Col, Card, InputGroup, Dropdown, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';

// Conditional import for PDF generation
let jsPDF;
let autoTable;

// Function to load PDF libraries dynamically
const loadPdfLibraries = async () => {
  if (typeof window !== 'undefined') {
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    jsPDF = jsPDFModule.default;
    autoTable = autoTableModule.default;
  }
};

const PaymentGatewayTab = ({ isSuperAdmin }) => {
  // State declarations
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank_account',
    status: 'active',
    min_amount: '',
    max_amount: '',
    fee_percentage: '',
    fixed_fee: '',
    description: '',
    merch_id: '',
    api_token: '',
    base_url: ''
  });
  const [editData, setEditData] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  // New states for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // States for transactions
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  
  // States for download
  const [gatewayNames, setGatewayNames] = useState([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [gatewayTransactions, setGatewayTransactions] = useState([]);
  const [loadingGatewayTransactions, setLoadingGatewayTransactions] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('gateway');

  // Fetch payment methods on component mount
  useEffect(() => {
    fetchPaymentMethods();
    fetchGatewayNames();
    fetchTransactions(); // Added this line
    // Load PDF libraries
    loadPdfLibraries();
  }, []);

  // Filter payment methods when search or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [paymentMethods, searchTerm, statusFilter, typeFilter]);

  // Filter transactions when search or filter criteria change
  useEffect(() => {
    applyTransactionFilters();
  }, [transactions, transactionSearchTerm, transactionStatusFilter, transactionTypeFilter]);

  // Fetch payment methods from API
  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payment-gateways`);

      setPaymentMethods(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setAlert({ show: true, message: 'Error fetching payment methods', variant: 'danger' });
      setLoading(false);
    }
  };

  // Fetch gateway names for download tab
  const fetchGatewayNames = async () => {
    setLoadingGateways(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payment-gateways/names`);
      setGatewayNames(response.data);
      setLoadingGateways(false);
    } catch (error) {
      console.error('Error fetching gateway names:', error);
      setAlert({ show: true, message: 'Error fetching gateway names', variant: 'danger' });
      setLoadingGateways(false);
    }
  };

  // Fetch transactions for transactions tab
  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payment-transactions/pay`);
      setTransactions(response.data);
      setLoadingTransactions(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAlert({ show: true, message: 'Error fetching transactions', variant: 'danger' });
      setLoadingTransactions(false);
    }
  };

  // Fetch transactions for a specific gateway
  const fetchGatewayTransactions = async (gatewayName) => {
    setLoadingGatewayTransactions(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/payment-transactions/by-gateway/${gatewayName}`);
      setGatewayTransactions(response.data);
      setLoadingGatewayTransactions(false);
    } catch (error) {
      console.error('Error fetching gateway transactions:', error);
      setAlert({ show: true, message: 'Error fetching gateway transactions', variant: 'danger' });
      setLoadingGatewayTransactions(false);
    }
  };

  // Apply filters and search to payment methods
  const applyFilters = () => {
    let result = [...paymentMethods];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(method => 
        method.name.toLowerCase().includes(term) || 
        method.description.toLowerCase().includes(term) ||
        method.merch_id.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(method => method.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(method => method.type === typeFilter);
    }
    
    setFilteredMethods(result);
  };

  // Apply filters and search to transactions - FIXED VERSION
  const applyTransactionFilters = () => {
    let result = [...transactions];
    
    // Apply search filter
    if (transactionSearchTerm) {
      const term = transactionSearchTerm.toLowerCase();
      result = result.filter(transaction => {
        // Safely check each field with null checks and convert to string
        const name = transaction.name ? String(transaction.name).toLowerCase() : '';
        const playerId = transaction.player_id ? String(transaction.player_id).toLowerCase() : '';
        const playerName = transaction.player_name ? String(transaction.player_name).toLowerCase() : '';
        const transactionId = transaction.transaction_id ? String(transaction.transaction_id).toLowerCase() : '';
        const merchId = transaction.merch_id ? String(transaction.merch_id).toLowerCase() : '';
        
        return (
          name.includes(term) || 
          playerId.includes(term) ||
          playerName.includes(term) ||
          transactionId.includes(term) ||
          merchId.includes(term)
        );
      });
    }
    
    // Apply status filter
    if (transactionStatusFilter !== 'all') {
      result = result.filter(transaction => String(transaction.status) === transactionStatusFilter);
    }
    
    // Apply type filter
    if (transactionTypeFilter !== 'all') {
      result = result.filter(transaction => String(transaction.transaction_type) === transactionTypeFilter);
    }
    
    setFilteredTransactions(result);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Clear all transaction filters
  const clearTransactionFilters = () => {
    setTransactionSearchTerm('');
    setTransactionStatusFilter('all');
    setTransactionTypeFilter('all');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // Submit new payment method form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/payment-gateways`, formData);
      setAlert({ show: true, message: `Payment method "${formData.name}" created successfully`, variant: 'success' });
      setShowModal(false);
      fetchPaymentMethods();
      fetchGatewayNames();
      setFormData({
        name: '',
        type: 'bank_account',
        status: 'active',
        min_amount: '',
        max_amount: '',
        fee_percentage: '',
        fixed_fee: '',
        description: '',
        merch_id: '',
        api_token: '',
        base_url: ''
      });
    } catch (error) {
      setAlert({ show: true, message: 'Error creating payment method', variant: 'danger' });
      console.error('Error creating payment method:', error);
    }
  };

  // Update payment method
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/payment-gateways/${editData.id}`, editData);
      setAlert({ show: true, message: `Payment method "${editData.name}" updated successfully`, variant: 'success' });
      setShowEditModal(false);
      fetchPaymentMethods();
      fetchGatewayNames();
    } catch (error) {
      setAlert({ show: true, message: 'Error updating payment method', variant: 'danger' });
      console.error('Error updating payment method:', error);
    }
  };

  // Delete payment method
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/payment-gateways/${id}`);
        setAlert({ show: true, message: 'Payment method deleted successfully', variant: 'success' });
        fetchPaymentMethods();
        fetchGatewayNames();
      } catch (error) {
        setAlert({ show: true, message: 'Error deleting payment method', variant: 'danger' });
        console.error('Error deleting payment method:', error);
      }
    }
  };

  // Toggle payment method status
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
     await axios.put(`${process.env.REACT_APP_API_URL}/api/payment-gateways/${id}/status`, { status: newStatus });
      setAlert({ show: true, message: `Payment method status updated to ${newStatus}`, variant: 'success' });
      fetchPaymentMethods();
    } catch (error) {
      setAlert({ show: true, message: 'Error updating payment method status', variant: 'danger' });
      console.error('Error updating payment method status:', error);
    }
  };

  // Open edit modal with selected payment method data
  const openEditModal = (method) => {
    setEditData(method);
    setShowEditModal(true);
  };

  // Get icon based on payment method type
  const getPaymentIcon = (type) => {
    switch (type) {
      case 'bank_account':
        return <FaLandmark className="me-2" />;
      case 'cash':
        return <FaMoneyBillWave className="me-2" />;
         case 'upi':
      return <FaMobileAlt className="me-2" />;
      case 'card':
        return <FaCreditCard className="me-2" />;
      case 'cryptocurrency':
        return <FaCoins className="me-2" />;
      default:
        return <FaMoneyBillWave className="me-2" />;
    }
  };

  // Generate PDF for gateway transactions
  const generatePDF = async () => {
    try {
      // Check if PDF libraries are loaded
      if (!jsPDF || !autoTable) {
        await loadPdfLibraries();
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Transactions Report - ${selectedGateway}`, 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
      
      // Prepare table data
      const tableData = gatewayTransactions.map(transaction => [
        transaction.name,
        transaction.player_id,
        transaction.player_name,
        transaction.transaction_id,
        transaction.merch_id,
        transaction.transaction_type,
        `₹${transaction.amount}`,
        transaction.status
      ]);
      
      // Add table
      autoTable(doc, {
        head: [['Gateway', 'Player ID', 'Player Name', 'Transaction ID', 'Merchant ID', 'Type', 'Amount', 'Status']],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [40, 167, 69],
          textColor: 255
        }
      });
      
      // Save the PDF
      doc.save(`${selectedGateway}_transactions.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setAlert({ show: true, message: 'Error generating PDF. Please try again.', variant: 'danger' });
    }
  };

  // Handle gateway selection for download
  const handleGatewaySelect = (gatewayName) => {
    setSelectedGateway(gatewayName);
    fetchGatewayTransactions(gatewayName);
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', minHeight: '100vh' }}>
      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      {/* Title with gradient color */}
      <div className="text-center mb-4">
        <h1 className="mb-0" style={{ 
          background: 'linear-gradient(to right, #28a745, #ffc107)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Payment Gateway
        </h1>
      </div>

      {/* Navigation Tabs */}
      <Nav variant="tabs" defaultActiveKey="gateway" className="mb-4 justify-content-center">
        <Nav.Item>
          <Nav.Link 
            eventKey="gateway" 
            onClick={() => setActiveTab('gateway')}
            className={activeTab === 'gateway' ? 'bg-success text-white' : ''}
          >
            Gateway
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="transactions" 
            onClick={() => {
              setActiveTab('transactions');
              fetchTransactions();
            }}
            className={activeTab === 'transactions' ? 'bg-success text-white' : ''}
          >
            Transactions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="download" 
            onClick={() => setActiveTab('download')}
            className={activeTab === 'download' ? 'bg-success text-white' : ''}
          >
            Download
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Gateway Tab Content */}
      {activeTab === 'gateway' && (
        <>
          {/* Add Payment Gateway Button */}
          <div className="d-flex justify-content-end mb-4">
            <Button 
              variant="success" 
              className="d-flex align-items-center"
              style={{ background: 'linear-gradient(45deg, #28a745, #ffc107)', border: 'none', color: '#ffffff' }}
              onClick={() => setShowModal(true)}
              disabled={!isSuperAdmin}
            >
              <FaPlus className="me-2" />
              Add Payment Gateway
            </Button>
          </div>

          {/* Search and Filter Section - Mobile Friendly */}
          <Card bg="dark" className="mb-4">
            <Card.Body>
              {/* Mobile Filter Toggle */}
              <div className="d-md-none mb-3">
                <Button 
                  variant="outline-secondary" 
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <FaFilter className="me-2" />
                  {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
              
              {/* Filters - Always visible on desktop, toggleable on mobile */}
              <div className={`${showMobileFilters ? 'd-block' : 'd-none'} d-md-block`}>
                <Row className="align-items-center">
                  <Col xs={12} md={6} className="mb-3 mb-md-0">
                    <InputGroup>
                      <InputGroup.Text className="bg-dark text-light border-secondary">
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, description or merchant ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-dark text-light border-secondary"
                      />
                    </InputGroup>
                  </Col>
                  <Col xs={6} md={3} className="mb-3 mb-md-0">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" className="w-100 bg-dark text-light border-secondary">
                        <FaFilter className="me-2" />
                        Status: {statusFilter === 'all' ? 'All' : statusFilter}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="bg-dark text-light">
                        <Dropdown.Item 
                          onClick={() => setStatusFilter('all')} 
                          className={statusFilter === 'all' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          All Statuses
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setStatusFilter('active')} 
                          className={statusFilter === 'active' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          Active
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setStatusFilter('inactive')} 
                          className={statusFilter === 'inactive' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          Inactive
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                  <Col xs={6} md={3}>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" className="w-100 bg-dark text-light border-secondary">
                        <FaFilter className="me-2" />
                        Type: {typeFilter === 'all' ? 'All' : typeFilter.replace('_', ' ')}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="bg-dark text-light">
                        <Dropdown.Item 
                          onClick={() => setTypeFilter('all')} 
                          className={typeFilter === 'all' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          All Types
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setTypeFilter('bank_account')} 
                          className={typeFilter === 'bank_account' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          Bank Account
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setTypeFilter('cash')} 
                          className={typeFilter === 'cash' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          Cash
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setTypeFilter('card')} 
                          className={typeFilter === 'card' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          Card
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setTypeFilter('upi')} 
                          className={typeFilter === 'upi' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          UPI
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => setTypeFilter('cryptocurrency')} 
                          className={typeFilter === 'cryptocurrency' ? 'bg-secondary' : 'bg-dark text-light'}
                        >
                          Cryptocurrency
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                </Row>
                
                <div className="mt-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
                  <div className="mb-2 mb-md-0">
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                      <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                        Clear Filters
                      </Button>
                    )}
                    <Badge bg="info" className="me-2">
                      {filteredMethods.length} of {paymentMethods.length} methods
                    </Badge>
                  </div>
                  {!isSuperAdmin && (
                    <Badge bg="warning" text="dark">
                      Super Admin Only
                    </Badge>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Methods Cards - Mobile Responsive */}
          <div className="row mb-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="warning" />
                <p className="mt-2 text-warning">Loading payment methods...</p>
              </div>
            ) : filteredMethods.length > 0 ? (
              filteredMethods.map((method) => (
                <Col xs={6} md={4} className="mb-4" key={method.id}>
                  <Card bg="dark" text="white" className="h-100">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {getPaymentIcon(method.type)}
                        <span className="text-truncate" style={{ maxWidth: '120px' }}>{method.name}</span>
                      </div>
                      <Badge bg={method.status === 'active' ? 'success' : 'danger'}>
                        {method.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>
                        <strong>Type:</strong> {method.type.replace('_', ' ')}<br />
                        <strong>Min Amount:</strong> <FaRupeeSign className="me-1" size={12} />{method.min_amount}<br />
                        <strong>Max Amount:</strong> <FaRupeeSign className="me-1" size={12} />{method.max_amount}<br />
                        <strong>Fee:</strong> {method.fee_percentage}% + <FaRupeeSign className="me-1" size={12} />{method.fixed_fee}<br />
                        <strong>Merchant ID:</strong> <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>{method.merch_id}</span><br />
                        <strong>Base URL:</strong> <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>{method.base_url}</span><br />
                        <strong>Description:</strong> {method.description ? `${method.description.substring(0, 60)}${method.description.length > 60 ? '...' : ''}` : 'No description'}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="d-flex flex-column flex-md-row justify-content-between">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="mb-2 mb-md-0"
                        onClick={() => openEditModal(method)}
                        disabled={!isSuperAdmin}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <div className="d-flex">
                        <Button 
                          variant={method.status === 'active' ? "outline-warning" : "outline-success"} 
                          size="sm"
                          className="me-2"
                          onClick={() => toggleStatus(method.id, method.status)}
                          disabled={!isSuperAdmin}
                        >
                          {method.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(method.id)}
                          disabled={!isSuperAdmin}
                        >
                          <FaTrash /> Delete
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="text-center py-5">
                <h4>No payment methods found</h4>
                <p>
                  {paymentMethods.length === 0 
                    ? 'Add a new payment method to get started' 
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Transactions Tab Content */}
      {activeTab === 'transactions' && (
        <>
          {/* Search and Filter Section */}
          <Card bg="dark" className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary">
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, player, transaction ID..."
                      value={transactionSearchTerm}
                      onChange={(e) => setTransactionSearchTerm(e.target.value)}
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Col>
                <Col xs={6} md={3} className="mb-3 mb-md-0">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100 bg-dark text-light border-secondary">
                      <FaFilter className="me-2" />
                      Status: {transactionStatusFilter === 'all' ? 'All' : transactionStatusFilter}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-dark text-light">
                      <Dropdown.Item 
                        onClick={() => setTransactionStatusFilter('all')} 
                        className={transactionStatusFilter === 'all' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        All Statuses
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => setTransactionStatusFilter('SUCCESS')} 
                        className={transactionStatusFilter === 'SUCCESS' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        Completed
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => setTransactionStatusFilter('PENDING')} 
                        className={transactionStatusFilter === 'PENDING' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        Pending
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => setTransactionStatusFilter('PROCESSING')} 
                        className={transactionStatusFilter === 'PROCESSING' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        Failed
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
                <Col xs={6} md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100 bg-dark text-light border-secondary">
                      <FaFilter className="me-2" />
                      Type: {transactionTypeFilter === 'all' ? 'All' : transactionTypeFilter}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-dark text-light">
                      <Dropdown.Item 
                        onClick={() => setTransactionTypeFilter('all')} 
                        className={transactionTypeFilter === 'all' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        All Types
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => setTransactionTypeFilter('ORDER')} 
                        className={transactionTypeFilter === 'ORDER' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        Deposit
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => setTransactionTypeFilter('PAYOUT')} 
                        className={transactionTypeFilter === 'PAYOUT' ? 'bg-secondary' : 'bg-dark text-light'}
                      >
                        Withdrawal
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
              
              <div className="mt-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="mb-2 mb-md-0">
                  {(transactionSearchTerm || transactionStatusFilter !== 'all' || transactionTypeFilter !== 'all') && (
                    <Button variant="outline-secondary" onClick={clearTransactionFilters} className="me-2">
                      Clear Filters
                    </Button>
                  )}
                  <Badge bg="info" className="me-2">
                    {filteredTransactions.length} of {transactions.length} transactions
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Transactions Table */}
          <Card bg="dark">
            <Card.Body>
              {loadingTransactions ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="mt-2 text-warning">Loading transactions...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover variant="dark">
                    <thead>
                      <tr>
                        <th>Gateway</th>
                        <th>Player ID</th>
                        <th>Player Name</th>
                        <th>Transaction ID</th>
                        <th>Merchant ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.transaction_id}>
                          <td>{transaction.name}</td>
                          <td>{transaction.player_id}</td>
                          <td>{transaction.player_name}</td>
                          <td>{transaction.transaction_id}</td>
                          <td>{transaction.merch_id}</td>
                          <td>{transaction.transaction_type}</td>
                          <td><FaRupeeSign className="me-1" size={12} />{transaction.amount}</td>
                          <td>
                            <Badge bg={
                              transaction.status === 'SUCCESS' ? 'success' : 
                              transaction.status === 'PENDING' ? 'warning' : 'danger'
                            }>
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <h4>No transactions found</h4>
                  <p>
                    {transactions.length === 0 
                      ? 'No transactions available' 
                      : 'Try adjusting your search or filter criteria'}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Download Tab Content */}
      {activeTab === 'download' && (
        <>
          <Card bg="dark" className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Download Transaction Reports</h4>
              
              {loadingGateways ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="mt-2 text-warning">Loading gateways...</p>
                </div>
              ) : gatewayNames.length > 0 ? (
                <Row>
                  {gatewayNames.map((gateway) => (
                    <Col xs={12} md={6} lg={4} className="mb-3" key={gateway.name}>
                      {/* CHANGED: Updated card styling from bg="secondary" text="white" to bg="light" text="danger" */}
                      <Card bg="light" text="danger" className="h-100">
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="text-center">{gateway.name}</Card.Title>
                          <div className="mt-auto d-flex justify-content-between">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleGatewaySelect(gateway.name)}
                            >
                              Show
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => {
                                handleGatewaySelect(gateway.name);
                                setTimeout(async () => {
                                  await generatePDF();
                                }, 500);
                              }}
                            >
                              <FaDownload className="me-1" /> PDF
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <h4>No gateways found</h4>
                  <p>Add payment gateways to generate reports</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Gateway Transactions */}
          {selectedGateway && (
            <Card bg="dark">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Transactions for {selectedGateway}</h5>
                <Button variant="success" onClick={generatePDF}>
                  <FaFilePdf className="me-2" /> Download PDF
                </Button>
              </Card.Header>
              <Card.Body>
                {loadingGatewayTransactions ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-2 text-warning">Loading transactions...</p>
                  </div>
                ) : gatewayTransactions.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped bordered hover variant="dark">
                      <thead>
                        <tr>
                          <th>Player ID</th>
                          <th>Player Name</th>
                          <th>Transaction ID</th>
                          <th>Merchant ID</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gatewayTransactions.map((transaction) => (
                          <tr key={transaction.transaction_id}>
                            <td>{transaction.player_id}</td>
                            <td>{transaction.player_name}</td>
                            <td>{transaction.transaction_id}</td>
                            <td>{transaction.merch_id}</td>
                            <td>{transaction.transaction_type}</td>
                            <td><FaRupeeSign className="me-1" size={12} />{transaction.amount}</td>
                            <td>
                              <Badge bg={
                                transaction.status === 'SUCCESS' ? 'success' : 
                                transaction.status === 'PENDING' ? 'warning' : 'danger'
                              }>
                                {transaction.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h4>No transactions found for {selectedGateway}</h4>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Add Payment Method Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="bg-dark text-light">
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>Add Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
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
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="bg-dark text-light border-secondary"
              >
                <option value="bank_account">Bank Account</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">Upi</option>
                <option value="cryptocurrency">Cryptocurrency</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="bg-dark text-light border-secondary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Amount (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="min_amount"
                      value={formData.min_amount}
                      onChange={handleInputChange}
                      required
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Amount (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="max_amount"
                      value={formData.max_amount}
                      onChange={handleInputChange}
                      required
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fee Percentage (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="fee_percentage"
                    value={formData.fee_percentage}
                    onChange={handleInputChange}
                    required
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fixed Fee (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="fixed_fee"
                      value={formData.fixed_fee}
                      onChange={handleInputChange}
                      required
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Merchant ID</Form.Label>
              <Form.Control
                type="text"
                name="merch_id"
                value={formData.merch_id}
                onChange={handleInputChange}
                required
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Token</Form.Label>
              <Form.Control
                type="text"
                name="api_token"
                value={formData.api_token}
                onChange={handleInputChange}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Base URL</Form.Label>
              <Form.Control
                type="text"
                name="base_url"
                value={formData.base_url}
                onChange={handleInputChange}
                required
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Add Payment Method
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Payment Method Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="bg-dark text-light">
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>Edit Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editData.name || ''}
                onChange={handleEditInputChange}
                required
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={editData.type || ''}
                onChange={handleEditInputChange}
                required
                className="bg-dark text-light border-secondary"
              >
                <option value="bank_account">Bank Account</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="cryptocurrency">Cryptocurrency</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={editData.status || ''}
                onChange={handleEditInputChange}
                required
                className="bg-dark text-light border-secondary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Amount (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="min_amount"
                      value={editData.min_amount || ''}
                      onChange={handleEditInputChange}
                      required
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Amount (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="max_amount"
                      value={editData.max_amount || ''}
                      onChange={handleEditInputChange}
                      required
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fee Percentage (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="fee_percentage"
                    value={editData.fee_percentage || ''}
                    onChange={handleEditInputChange}
                    required
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fixed Fee (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark text-light border-secondary"><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="fixed_fee"
                      value={editData.fixed_fee || ''}
                      onChange={handleEditInputChange}
                      required
                      className="bg-dark text-light border-secondary"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Merchant ID</Form.Label>
              <Form.Control
                type="text"
                name="merch_id"
                value={editData.merch_id || ''}
                onChange={handleEditInputChange}
                required
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Token</Form.Label>
              <Form.Control
                type="text"
                name="api_token"
                value={editData.api_token || ''}
                onChange={handleEditInputChange}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Base URL</Form.Label>
              <Form.Control
                type="text"
                name="base_url"
                value={editData.base_url || ''}
                onChange={handleEditInputChange}
                required
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editData.description || ''}
                onChange={handleEditInputChange}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Update Payment Method
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PaymentGatewayTab;