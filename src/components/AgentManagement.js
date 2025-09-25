import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faEye, faSearch, faUsers, faRedo, 
  faChevronLeft, faChevronRight, faUser, faEnvelope, 
  faPhone, faPercent, faCalendar, faMoneyBillWave, 
  faMoneyCheckAlt, faTicketAlt, faUserFriends, faCoins,
  faCreditCard, faFileImage, faCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Alert, Table, InputGroup, FormControl, Row, Col, Spinner, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [totalAgents, setTotalAgents] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    commission: '10%'
  });

  // Transaction states
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [players, setPlayers] = useState([]);
  
  // Modals states
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [showGiveMoneyModal, setShowGiveMoneyModal] = useState(false);
  const [showViewDepositModal, setShowViewDepositModal] = useState(false);
  const [showViewWithdrawalModal, setShowViewWithdrawalModal] = useState(false);
  const [showViewTicketModal, setShowViewTicketModal] = useState(false);
  
  // Form states for transactions
  const [agentId, setAgentId] = useState('');
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Search states
  const [depositSearch, setDepositSearch] = useState('');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [playerAgentId, setPlayerAgentId] = useState('');

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
    fetchTotalAgents();
    fetchDeposits();
    fetchWithdrawals();
    fetchTickets();
  }, []);

  // Apply filters when agents, search term, or filter values change
  useEffect(() => {
    applyFilters();
  }, [agents, searchTerm, commissionFilter, performanceFilter]);

  const fetchAgents = async () => {
    setLoading(true);
   try {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/agents`);
      setAgents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAlert({ show: true, message: 'Error fetching agents', variant: 'danger' });
      setLoading(false);
    }
  };

  const fetchTotalAgents = async () => {
   try {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/agents/count`);
      setTotalAgents(response.data.count);
    } catch (error) {
      console.error('Error fetching agent count:', error);
    }
  };

  const fetchDeposits = async () => {
   try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/deposits/pending`);
      setDeposits(response.data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };


const fetchWithdrawals = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/withdrawals/pending`);
    const data = response.data;

    // make sure withdrawals is always an array
    setWithdrawals(Array.isArray(data) ? data : data.withdrawals || []);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
  }
};


const fetchTickets = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tickets/open`);
    const data = response.data;

    // ensure it's always an array
    setTickets(Array.isArray(data) ? data : data.tickets || []);
  } catch (error) {
    console.error('Error fetching tickets:', error);
  }
};


  const fetchPlayers = async (agentId) => {
   try {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/players/${agentId}`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

const applyFilters = () => {
  if (!Array.isArray(agents)) {
    setFilteredAgents([]);
    return;
  }

  let result = [...agents];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    result = result.filter(agent => 
      agent.name?.toLowerCase().includes(term) ||
      agent.email?.toLowerCase().includes(term) ||
      agent.mobile?.includes(term) ||
      agent.commission?.toLowerCase().includes(term)
    );
  }

  if (commissionFilter) {
    result = result.filter(agent => agent.commission === commissionFilter);
  }

  if (performanceFilter) {
    result = result.filter(agent => {
      if (performanceFilter === 'high') return agent.player_count > 50;
      if (performanceFilter === 'medium') return agent.player_count >= 20 && agent.player_count <= 50;
      if (performanceFilter === 'low') return agent.player_count < 20;
      return true;
    });
  }

  setFilteredAgents(result);
  setCurrentPage(1);
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddAgent = async () => {
    try {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/agents`,formData);
      
      if (response.status === 201) {
        setAlert({ show: true, message: `Agent created successfully`, variant: 'success' });
        fetchAgents();
        fetchTotalAgents();
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          mobile: '',
          password: '',
          commission: '10%'
        });
      } else {
        setAlert({ show: true, message: 'Error adding agent', variant: 'danger' });
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      setAlert({ show: true, message: 'Error adding agent', variant: 'danger' });
    }
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setShowViewModal(true);
  };

  // Reset filters and search
  const resetFilters = () => {
    setCommissionFilter('');
    setPerformanceFilter('');
    setSearchTerm('');
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Transaction handlers
  const handleSearchAgentForDeposit = async () => {
   try {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/agentlogin/${agentId}`);
      setSelectedAgent(response.data);
    } catch (error) {
      console.error('Error fetching agent:', error);
      setAlert({ show: true, message: 'Agent not found', variant: 'danger' });
    }
  };

  const handleAddAmount = async () => {
    try {
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/deposits`,{
        agent_id: agentId,
        amount: amount
      });
      
      if (response.status === 201) {
        setAlert({ show: true, message: 'Deposit added successfully', variant: 'success' });
        setShowAddAmountModal(false);
        setAgentId('');
        setAmount('');
        setSelectedAgent(null);
        fetchDeposits();
      }
    } catch (error) {
      console.error('Error adding deposit:', error);
      setAlert({ show: true, message: 'Error adding deposit', variant: 'danger' });
    }
  };

  const handleSearchAgentForWithdrawal = async () => {
   try {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/agentlogin/${agentId}`);
      setSelectedAgent(response.data);
    } catch (error) {
      console.error('Error fetching agent:', error);
      setAlert({ show: true, message: 'Agent not found', variant: 'danger' });
    }
  };

  const handleGiveMoney = async () => {
    try {
       const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/withdrawals`,{
        agent_id: agentId,
        amount: amount
      });
      
      if (response.status === 201) {
        setAlert({ show: true, message: 'Withdrawal processed successfully', variant: 'success' });
        setShowGiveMoneyModal(false);
        setAgentId('');
        setAmount('');
        setSelectedAgent(null);
        fetchWithdrawals();
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      setAlert({ show: true, message: 'Error processing withdrawal', variant: 'danger' });
    }
  };

  const handleAcceptDeposit = async () => {
   try {
  await axios.put(`${process.env.REACT_APP_API_URL}/api/deposits/${selectedDeposit.id}/accept`);
      setAlert({ show: true, message: 'Deposit accepted', variant: 'success' });
      setShowViewDepositModal(false);
      fetchDeposits();
    } catch (error) {
      console.error('Error accepting deposit:', error);
      setAlert({ show: true, message: 'Error accepting deposit', variant: 'danger' });
    }
  };

  const handleAcceptWithdrawal = async () => {
   try {
  await axios.put(`${process.env.REACT_APP_API_URL}/api/withdrawals/${selectedWithdrawal.id}/accept`);
      setAlert({ show: true, message: 'Withdrawal accepted', variant: 'success' });
      setShowViewWithdrawalModal(false);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error accepting withdrawal:', error);
      setAlert({ show: true, message: 'Error accepting withdrawal', variant: 'danger' });
    }
  };

  const handleAcceptTicket = async () => {
    try {
  await axios.put(`${process.env.REACT_APP_API_URL}/api/tickets/${selectedTicket.id}/close`);
      setAlert({ show: true, message: 'Ticket closed', variant: 'success' });
      setShowViewTicketModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      setAlert({ show: true, message: 'Error closing ticket', variant: 'danger' });
    }
  };

  const handleRejectTicket = async () => {
   try {
  await axios.put(`${process.env.REACT_APP_API_URL}/api/tickets/${selectedTicket.id}/reject`);
      setAlert({ show: true, message: 'Ticket rejected', variant: 'warning' });
      setShowViewTicketModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error rejecting ticket:', error);
      setAlert({ show: true, message: 'Error rejecting ticket', variant: 'danger' });
    }
  };

  const handleSearchPlayers = () => {
    if (playerAgentId) {
      fetchPlayers(playerAgentId);
    }
  };

  // Filter functions
  const filteredDeposits = Array.isArray(deposits)
  ? deposits.filter(deposit => {
      const search = depositSearch.toLowerCase();
      return (
        deposit.agent_id.toString().includes(search) ||
        deposit.agent_name.toLowerCase().includes(search) ||
        deposit.amount.toString().includes(search)
      );
    })
  : [];


  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const search = withdrawalSearch.toLowerCase();
    return (
      withdrawal.agent_id.toString().includes(search) ||
      withdrawal.agent_name.toLowerCase().includes(search)
    );
  });

  const filteredTickets = tickets.filter(ticket => {
    const search = ticketSearch.toLowerCase();
    return (
      ticket.agent_id.toString().includes(search) ||
      ticket.agent_name.toLowerCase().includes(search) ||
      ticket.subject.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', minHeight: '100vh' }}>
      {/* Custom styles for mobile responsiveness and active nav link */}
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
        
        /* Style for active nav link */
        .nav-tabs .nav-link.active {
          background-color: #28a745 !important;
          border-color: #28a745 !important;
          color: white !important;
        }
        
        /* Also style for transaction sub-tabs */
        .nav-tabs .nav-link.active:hover {
          background-color: #218838 !important;
          border-color: #1e7e34 !important;
        }
      `}</style>
      
      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}
      
      {/* Title */}
      <h1 className="text-center mb-4 text-warning">Agent Management</h1>
      
      {/* Navigation Tabs */}
      <Tab.Container id="agent-management-tabs" defaultActiveKey="agents">
        <Nav variant="tabs" className="mb-4 bg-dark">
          <Nav.Item>
            <Nav.Link eventKey="agents" className="text-light">
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Agents
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="transactions" className="text-light">
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
              Transactions
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tickets" className="text-light">
              <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
              Tickets
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="players" className="text-light">
              <FontAwesomeIcon icon={faUserFriends} className="me-2" />
              Players
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          {/* Agents Tab */}
          <Tab.Pane eventKey="agents">
            {/* Add Agent Button and Agent Count */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <Button 
                variant="success" 
                className="d-flex align-items-center mb-2 mb-md-0"
                style={{ background: 'linear-gradient(45deg, #28a745, #ffc107)', border: 'none', color: '#ffffff' }}
                onClick={() => setShowAddModal(true)}
              >
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                <span className="d-none d-sm-inline">Add New Agent</span>
              </Button>
              <Button variant="outline-light">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Total Agents: {totalAgents}
              </Button>
            </div>
            
            {/* Filters and Search */}
            <div className="row mb-4">
              <div className="col-md-8 mb-3 mb-md-0">
                <div className="d-flex flex-wrap">
                  <div className="me-2 mb-2 flex-grow-1" style={{ minWidth: '120px' }}>
                    <Form.Select 
                      value={commissionFilter} 
                      onChange={(e) => setCommissionFilter(e.target.value)}
                    >
                      <option value="">All Commissions</option>
                      <option value="5%">5%</option>
                      <option value="10%">10%</option>
                      <option value="15%">15%</option>
                      <option value="20%">20%</option>
                    </Form.Select>
                  </div>
                  <div className="me-2 mb-2 flex-grow-1" style={{ minWidth: '120px' }}>
                    <Form.Select 
                      value={performanceFilter} 
                      onChange={(e) => setPerformanceFilter(e.target.value)}
                    >
                      <option value="">All Performance Levels</option>
                      <option value="high">High Performance</option>
                      <option value="medium">Medium Performance</option>
                      <option value="low">Low Performance</option>
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
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-dark text-light"
                  />
                </div>
              </div>
            </div>
            
            {/* Agents Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                  <p className="mt-2 text-warning">Loading agents...</p>
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
                        <th>Commission</th>
                        <th>Performance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? currentItems.map((agent) => (
                        <tr key={agent.id}>
                          <td className="d-none d-md-table-cell">{agent.id}</td>
                          <td>{agent.name}</td>
                          <td className="d-none d-sm-table-cell">{agent.email}</td>
                          <td>{agent.mobile}</td>
                          <td>{agent.commission}</td>
                          <td>
                            {agent.player_count > 50 ? (
                              <span className="badge bg-success">High</span>
                            ) : agent.player_count >= 20 ? (
                              <span className="badge bg-warning">Medium</span>
                            ) : (
                              <span className="badge bg-danger">Low</span>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleViewAgent(agent)}
                            >
                              <FontAwesomeIcon icon={faEye} /> <span className="d-none d-sm-inline">View</span>
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="text-center py-3">
                            No agents found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  
                  {/* Pagination Controls */}
                  {filteredAgents.length > itemsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAgents.length)} of {filteredAgents.length} entries
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
          </Tab.Pane>
          
          {/* Transactions Tab */}
          <Tab.Pane eventKey="transactions">
            <Tab.Container id="transaction-tabs" defaultActiveKey="deposit">
              <Nav variant="tabs" className="mb-4 bg-dark">
                <Nav.Item>
                  <Nav.Link eventKey="deposit" className="text-light">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                    Deposit
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="withdraw" className="text-light">
                    <FontAwesomeIcon icon={faMoneyCheckAlt} className="me-2" />
                    Withdraw
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content>
                {/* Deposit Sub-Tab */}
                <Tab.Pane eventKey="deposit">
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <Button 
                        variant="primary" 
                        className="d-flex align-items-center"
                        style={{ background: 'linear-gradient(45deg, #007bff, #28a745)', border: 'none', color: '#ffffff' }}
                        onClick={() => setShowAddAmountModal(true)}
                      >
                        <FontAwesomeIcon icon={faCoins} className="me-2" />
                        Add Amount
                      </Button>
                    </div>
                    <div className="col-md-6">
                      <InputGroup>
                        <InputGroup.Text className="bg-dark text-light">
                          <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by agent ID, name, or amount..."
                          value={depositSearch}
                          onChange={(e) => setDepositSearch(e.target.value)}
                          className="bg-dark text-light"
                        />
                      </InputGroup>
                    </div>
                  </div>
                  
                  {/* Deposits Table */}
                  <div className="table-responsive">
                    <Table striped bordered hover variant="dark" className="mobile-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Agent ID</th>
                          <th>Agent Name</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeposits.length > 0 ? filteredDeposits.map((deposit, index) => (
                          <tr key={deposit.id}>
                            <td>{index + 1}</td>
                            <td>{deposit.agent_id}</td>
                            <td>{deposit.agent_name}</td>
                            <td>{deposit.amount}</td>
                            <td>
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => {
                                  setSelectedDeposit(deposit);
                                  setShowViewDepositModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="text-center py-3">
                              No pending deposits found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>
                
                {/* Withdraw Sub-Tab */}
                <Tab.Pane eventKey="withdraw">
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <Button 
                        variant="danger" 
                        className="d-flex align-items-center"
                        onClick={() => setShowGiveMoneyModal(true)}
                      >
                        <FontAwesomeIcon icon={faMoneyCheckAlt} className="me-2" />
                        Give Money
                      </Button>
                    </div>
                    <div className="col-md-6">
                      <InputGroup>
                        <InputGroup.Text className="bg-dark text-light">
                          <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by agent ID or name..."
                          value={withdrawalSearch}
                          onChange={(e) => setWithdrawalSearch(e.target.value)}
                          className="bg-dark text-light"
                        />
                      </InputGroup>
                    </div>
                  </div>
                  
                  {/* Withdrawals Table */}
                  <div className="table-responsive">
                    <Table striped bordered hover variant="dark" className="mobile-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Agent ID</th>
                          <th>Agent Name</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal, index) => (
                          <tr key={withdrawal.id}>
                            <td>{index + 1}</td>
                            <td>{withdrawal.agent_id}</td>
                            <td>{withdrawal.agent_name}</td>
                            <td>{withdrawal.amount}</td>
                            <td>
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setShowViewWithdrawalModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="text-center py-3">
                              No pending withdrawals found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Tab.Pane>
          
          {/* Tickets Tab */}
          <Tab.Pane eventKey="tickets">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-center w-100">Tickets</h2>
              <InputGroup className="w-50">
                <InputGroup.Text className="bg-dark text-light">
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by agent ID, name, or subject..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="bg-dark text-light"
                />
              </InputGroup>
            </div>
            
            {/* Tickets Table */}
            <div className="table-responsive">
              <Table striped bordered hover variant="dark" className="mobile-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Agent ID</th>
                    <th>Agent Name</th>
                    <th>Subject</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length > 0 ? filteredTickets.map((ticket, index) => (
                    <tr key={ticket.id}>
                      <td>{index + 1}</td>
                      <td>{ticket.agent_id}</td>
                      <td>{ticket.agent_name}</td>
                      <td>{ticket.subject}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowViewTicketModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        No open tickets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Tab.Pane>
          
          {/* Players Tab */}
          <Tab.Pane eventKey="players">
            <div className="row mb-4">
              <div className="col-md-6 offset-md-3">
                <InputGroup>
                  <InputGroup.Text className="bg-dark text-light">
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter Agent ID"
                    value={playerAgentId}
                    onChange={(e) => setPlayerAgentId(e.target.value)}
                    className="bg-dark text-light"
                  />
                  <Button variant="success" onClick={handleSearchPlayers}>
                    Search
                  </Button>
                </InputGroup>
              </div>
            </div>
            
            {/* Players Table */}
            {players.length > 0 && (
              <div className="table-responsive">
                <Table striped bordered hover variant="dark" className="mobile-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Wallet Balance</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map(player => (
                      <tr key={player.id}>
                        <td>{player.id}</td>
                        <td>{player.name}</td>
                        <td>{player.email}</td>
                        <td>{player.mobile}</td>
                        <td>{player.wallet_balance}</td>
                        <td>{player.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      
      {/* Add Agent Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Add New Agent
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form>
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
                className="bg-dark text-light"
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
                className="bg-dark text-light"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                Mobile
              </Form.Label>
              <Form.Control
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                className="bg-dark text-light"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="bg-dark text-light"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faPercent} className="me-2" />
                Commission
              </Form.Label>
              <Form.Select
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                className="bg-dark text-light"
              >
                <option value="5%">5%</option>
                <option value="10%">10%</option>
                <option value="15%">15%</option>
                <option value="20%">20%</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="button" variant="success" onClick={handleAddAgent}>
                Add Agent
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* View Agent Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            {selectedAgent ? `${selectedAgent.name} (ID: ${selectedAgent.id})` : 'Agent Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedAgent && (
            <div>
              <h5 className="text-warning">Agent Details</h5>
              <Row className="mb-2">
                <Col sm={4}><strong>ID:</strong></Col>
                <Col sm={8}>{selectedAgent.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Name:</strong></Col>
                <Col sm={8}>{selectedAgent.name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Email:</strong></Col>
                <Col sm={8}>{selectedAgent.email}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Mobile:</strong></Col>
                <Col sm={8}>{selectedAgent.mobile}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Commission:</strong></Col>
                <Col sm={8}>{selectedAgent.commission}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Player Count:</strong></Col>
                <Col sm={8}>{selectedAgent.player_count || 0}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Performance Level:</strong></Col>
                <Col sm={8}>
                  {selectedAgent.player_count > 50 ? (
                    <span className="badge bg-success">High</span>
                  ) : selectedAgent.player_count >= 20 ? (
                    <span className="badge bg-warning">Medium</span>
                  ) : (
                    <span className="badge bg-danger">Low</span>
                  )}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Created At:</strong></Col>
                <Col sm={8}>{new Date(selectedAgent.created_at).toLocaleString()}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Updated At:</strong></Col>
                <Col sm={8}>{new Date(selectedAgent.updated_at).toLocaleString()}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Add Amount Modal */}
      <Modal show={showAddAmountModal} onHide={() => {
        setShowAddAmountModal(false);
        setSelectedAgent(null);
        setAgentId('');
        setAmount('');
      }} centered>
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faCoins} className="me-2" />
            Add Amount
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Agent ID</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="bg-dark text-light"
                />
                <Button variant="success" onClick={handleSearchAgentForDeposit}>
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
            </Form.Group>
            
            {selectedAgent && (
              <>
                <Row className="mb-3">
                  <Col sm={4}><strong>Name:</strong></Col>
                  <Col sm={8}>{selectedAgent.agent_name}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Email:</strong></Col>
                  <Col sm={8}>{selectedAgent.email}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Mobile:</strong></Col>
                  <Col sm={8}>{selectedAgent.mobile}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Balance:</strong></Col>
                  <Col sm={8}>{selectedAgent.balance}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Created At:</strong></Col>
                  <Col sm={8}>{new Date(selectedAgent.created_at).toLocaleString()}</Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faCoins} className="me-2" />
                    Amount
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-dark text-light"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={() => {
                    setShowAddAmountModal(false);
                    setSelectedAgent(null);
                    setAgentId('');
                    setAmount('');
                  }} className="me-2">
                    Cancel
                  </Button>
                  <Button variant="success" onClick={handleAddAmount}>
                    Add
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Give Money Modal */}
      <Modal show={showGiveMoneyModal} onHide={() => {
        setShowGiveMoneyModal(false);
        setSelectedAgent(null);
        setAgentId('');
        setAmount('');
      }} centered>
        <Modal.Header closeButton className="bg-danger text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faMoneyCheckAlt} className="me-2" />
            Give Money
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Agent ID</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="bg-dark text-light"
                />
                <Button variant="success" onClick={handleSearchAgentForWithdrawal}>
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
            </Form.Group>
            
            {selectedAgent && (
              <>
                <Row className="mb-3">
                  <Col sm={4}><strong>Name:</strong></Col>
                  <Col sm={8}>{selectedAgent.agent_name}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Email:</strong></Col>
                  <Col sm={8}>{selectedAgent.email}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Mobile:</strong></Col>
                  <Col sm={8}>{selectedAgent.mobile}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Balance:</strong></Col>
                  <Col sm={8}>{selectedAgent.balance}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4}><strong>Created At:</strong></Col>
                  <Col sm={8}>{new Date(selectedAgent.created_at).toLocaleString()}</Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faCoins} className="me-2" />
                    Amount
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-dark text-light"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={() => {
                    setShowGiveMoneyModal(false);
                    setSelectedAgent(null);
                    setAgentId('');
                    setAmount('');
                  }} className="me-2">
                    Cancel
                  </Button>
                  <Button variant="success" onClick={handleGiveMoney}>
                    Give
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* View Deposit Modal */}
      <Modal show={showViewDepositModal} onHide={() => setShowViewDepositModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faCoins} className="me-2" />
            ADD AMOUNT
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedDeposit && (
            <div>
              <Row className="mb-2">
                <Col sm={4}><strong>S.No:</strong></Col>
                <Col sm={8}>{selectedDeposit.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Agent ID:</strong></Col>
                <Col sm={8}>{selectedDeposit.agent_id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Agent Name:</strong></Col>
                <Col sm={8}>{selectedDeposit.agent_name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Amount:</strong></Col>
                <Col sm={8}>{selectedDeposit.amount}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Status:</strong></Col>
                <Col sm={8}>{selectedDeposit.status}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowViewDepositModal(false)}>
            Close
          </Button>
          {selectedDeposit && selectedDeposit.status === 'pending' && (
            <Button variant="success" onClick={handleAcceptDeposit}>
              Accept
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* View Withdrawal Modal */}
      <Modal show={showViewWithdrawalModal} onHide={() => setShowViewWithdrawalModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faMoneyCheckAlt} className="me-2" />
            Withdraw
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedWithdrawal && (
            <div>
              <Row className="mb-2">
                <Col sm={4}><strong>ID:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Agent ID:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.agent_id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Agent Name:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.agent_name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Payment Date:</strong></Col>
                <Col sm={8}>{new Date(selectedWithdrawal.payment_date).toLocaleString()}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Amount:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.amount}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Status:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.status}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Account Number:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.account_number}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Account Name:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.account_name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Bank Name:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.bank_name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>IFSC:</strong></Col>
                <Col sm={8}>{selectedWithdrawal.ifsc}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
<Modal.Footer className="bg-dark">
  <Button variant="secondary" onClick={() => setShowViewWithdrawalModal(false)}>
    Close
  </Button>
  {selectedWithdrawal && selectedWithdrawal.status === 'pending' && (
    <>
      <Button variant="danger" onClick={handleAcceptWithdrawal}>
        <FontAwesomeIcon icon={faMoneyCheckAlt} className="me-2" />
        Withdraw
      </Button>
    </>
  )}
</Modal.Footer>
      </Modal>
      
      {/* View Ticket Modal */}
      <Modal show={showViewTicketModal} onHide={() => setShowViewTicketModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
            Tickets
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedTicket && (
            <div>
              <Row className="mb-2">
                <Col sm={4}><strong>ID:</strong></Col>
                <Col sm={8}>{selectedTicket.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Subject:</strong></Col>
                <Col sm={8}>{selectedTicket.subject}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Message:</strong></Col>
                <Col sm={8}>{selectedTicket.message}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Email:</strong></Col>
                <Col sm={8}>{selectedTicket.email}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Evidence:</strong></Col>
                <Col sm={8}>
                  {selectedTicket.evidence ? (
                    <img 
                      src={selectedTicket.evidence} 
                      alt="Evidence" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  ) : (
                    <span>Evidence not found</span>
                  )}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Created At:</strong></Col>
                <Col sm={8}>{new Date(selectedTicket.created_at).toLocaleString()}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Agent ID:</strong></Col>
                <Col sm={8}>{selectedTicket.agent_id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Agent Name:</strong></Col>
                <Col sm={8}>{selectedTicket.agent_name}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="danger" onClick={handleRejectTicket}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Reject
          </Button>
          <Button variant="success" onClick={handleAcceptTicket}>
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            Accept
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AgentManagement;