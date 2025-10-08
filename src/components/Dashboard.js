import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserTie, faUserShield, faUserSecret, faGamepad,
  faMoneyBillWave, faChartLine, faTicketAlt, faExchangeAlt, 
  faCalendarAlt, faEye, faCheckCircle, faTimesCircle, 
  faClock, faSpinner, faSearch, faPlus, faUserCheck, faUserTimes
} from '@fortawesome/free-solid-svg-icons';
import { Card, Row, Col, Table, Badge, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalAgents: 0,
    totalAdmin: 0,
    totalSuperAdmin: 0,
    totalGames: 0,
    activeGames: 0,
    inactiveGames: 0,
    totalPlayerDeposit: 0,
    totalAgentDeposit: 0,
    totalOpenTickets: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    recentTickets: [],
    recentTransactions: []
  });
  const [adminData, setAdminData] = useState([]);
  const [filteredAdminData, setFilteredAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAdminData();
  }, []);

  useEffect(() => {
    // Filter admin data based on search term
    if (!searchTerm.trim()) {
      setFilteredAdminData(adminData);
      return;
    }
    
    const filtered = adminData.filter(admin => 
      admin.id.toString().includes(searchTerm) ||
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.mobile.includes(searchTerm)
    );
    
    setFilteredAdminData(filtered);
  }, [searchTerm, adminData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dash`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dash/admins`);
      setAdminData(response.data);
      setFilteredAdminData(response.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'Active':
      case 'resolved':
        return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} /> {status}</Badge>;
      case 'pending':
      case 'open':
        return <Badge bg="warning"><FontAwesomeIcon icon={faClock} /> {status}</Badge>;
      case 'failed':
      case 'Suspended':
      case 'rejected':
        return <Badge bg="danger"><FontAwesomeIcon icon={faTimesCircle} /> {status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Helper function to safely format currency values with Indian Rupee symbol
  const formatCurrency = (value) => {
    const numValue = Number(value);
    return isNaN(numValue) ? '₹0.00' : `₹${numValue.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2 text-warning">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
        <Button variant="outline-danger" size="sm" className="ms-2" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', minHeight: '100vh' }}>
      <h1 className="text-center mb-4">
        <span style={{ color: 'red' }}>Admin</span> 
        <span style={{ color: '#10b981' }}> Dashboard</span>
      </h1>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        {/* Row 1 - User Stats */}
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-primary">
                <FontAwesomeIcon icon={faUsers} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Total Users</Card.Title>
                <Card.Text className="fs-6">{dashboardData.totalUsers || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-success">
                <FontAwesomeIcon icon={faUserCheck} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Active Users</Card.Title>
                <Card.Text className="fs-6">{dashboardData.activeUsers || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-danger">
                <FontAwesomeIcon icon={faUserTimes} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Suspended Users</Card.Title>
                <Card.Text className="fs-6">{dashboardData.suspendedUsers || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-primary">
                <FontAwesomeIcon icon={faUserTie} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Total Agents</Card.Title>
                <Card.Text className="fs-6">{dashboardData.totalAgents || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Row 2 - Admin & Game Stats */}
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-info">
                <FontAwesomeIcon icon={faUserShield} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Total Admin</Card.Title>
                <Card.Text className="fs-6">{dashboardData.totalAdmin || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-danger">
                <FontAwesomeIcon icon={faUserSecret} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Total Super Admin</Card.Title>
                <Card.Text className="fs-6">{dashboardData.totalSuperAdmin || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-success">
                <FontAwesomeIcon icon={faGamepad} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Active Games</Card.Title>
                <Card.Text className="fs-6">{dashboardData.activeGames || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-warning">
                <FontAwesomeIcon icon={faGamepad} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Inactive Games</Card.Title>
                <Card.Text className="fs-6">{dashboardData.inactiveGames || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Row 3 - Financial Stats */}
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-success">
                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Player Deposits</Card.Title>
                <Card.Text className="fs-6">{formatCurrency(dashboardData.totalPlayerDeposit)}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-primary">
                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Agent Deposits</Card.Title>
                <Card.Text className="fs-6">{formatCurrency(dashboardData.totalAgentDeposit)}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-warning">
                <FontAwesomeIcon icon={faTicketAlt} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Open Tickets</Card.Title>
                <Card.Text className="fs-6">{dashboardData.totalOpenTickets || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 bg-dark text-light border-secondary">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3 text-info">
                <FontAwesomeIcon icon={faChartLine} size="2x" />
              </div>
              <div>
                <Card.Title className="fs-6">Total Games</Card.Title>
                <Card.Text className="fs-6">{dashboardData.totalGames || 0}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Admin Management Section */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-light border-secondary">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className='text-danger fw-4'><FontAwesomeIcon icon={faUserShield} className="me-2 text-danger" />Admin Management</Card.Title>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Search by ID, Name, Email, Mobile"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-dark text-white border-secondary me-2"
                  style={{ width: '250px' }}
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover variant="dark" responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminData.length > 0 ? (
                    filteredAdminData.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.id}</td>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>{admin.mobile}</td>
                        <td>{formatDate(admin.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No admin data found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Tickets */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-dark text-light border-secondary">
            <Card.Header>
              <Card.Title><FontAwesomeIcon icon={faTicketAlt} className="me-2" />Recent Tickets</Card.Title>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentTickets && dashboardData.recentTickets.length > 0 ? (
                <Table striped bordered hover variant="dark" responsive>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTickets.map((ticket, index) => (
                      <tr key={index}>
                        <td>{ticket.user_name}</td>
                        <td>{ticket.subject}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>{formatDate(ticket.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center">No recent tickets</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Transactions */}
      <Row>
        <Col>
          <Card className="bg-dark text-light border-secondary">
            <Card.Header>
              <Card.Title><FontAwesomeIcon icon={faExchangeAlt} className="me-2" />Recent Transactions</Card.Title>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                <Table striped bordered hover variant="dark" responsive>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.user_name}</td>
                        <td>{transaction.type}</td>
                        <td>{formatCurrency(transaction.amount)}</td>
                        <td>{transaction.payment_method || 'N/A'}</td>
                        <td>{getStatusBadge(transaction.status)}</td>
                        <td>{formatDate(transaction.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center">No recent transactions</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;