import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGamepad, faPlus, faEye, faSearch, faFilter, faRedo,
  faChevronLeft, faChevronRight, faTag, faDollarSign,
  faImage, faCalendar, faToggleOn, faToggleOff, faIdCard,
  faUpload, faTimes, faEdit
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Alert, Table, Spinner, Row, Col, Badge, Image } from 'react-bootstrap';
import axios from 'axios';

const GameManagement = () => {
  // State declarations
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [gameCount, setGameCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Form state for Add Game
  const [formData, setFormData] = useState({
    name: '',
    gameCode: '',
    providerCode: '',
    category: '',
    bet_amount: '100.00',
    status: 'active'
  });
  
  // Form state for Update Game
  const [updateData, setUpdateData] = useState({
    id: '',
    name: '',
    gameCode: '',
    providerCode: '',
    category: '',
    bet_amount: '',
    image_url: ''
  });
  
  // Image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Fetch games and count on component mount and when filters change
  useEffect(() => {
    fetchGames();
    fetchGameCount();
  }, [filters]);
  
  // Apply search and filters whenever games or searchTerm changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [games, searchTerm]);
  
  // Fetch games from API
  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/games`, {
        params: filters
      });
      setGames(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching games:', error);
      setAlert({ show: true, message: 'Error fetching games', variant: 'danger' });
      setLoading(false);
    }
  };
  
  // Fetch game count from API
  const fetchGameCount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/games/count`);
      setGameCount(response.data.count);
    } catch (error) {
      console.error('Error fetching game count:', error);
    }
  };
  
  // Apply search and filters
  const applyFiltersAndSearch = () => {
    let result = [...games];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(game => 
        game.id.toString().includes(term) ||
        game.name.toLowerCase().includes(term) ||
        game.category.toLowerCase().includes(term) ||
        (game.gameCode && game.gameCode.toLowerCase().includes(term)) ||
        (game.providerCode && game.providerCode.toLowerCase().includes(term))
      );
    }
    
    setFilteredGames(result);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Handle form input changes for Add Game
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle form input changes for Update Game
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData({ ...updateData, [name]: value });
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
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
  };
  
  // Submit new game form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    formDataObj.append('name', formData.name);
    formDataObj.append('gameCode', formData.gameCode);
    formDataObj.append('providerCode', formData.providerCode);
    formDataObj.append('category', formData.category);
    formDataObj.append('bet_amount', formData.bet_amount);
    formDataObj.append('status', formData.status);
    
    if (selectedFile) {
      formDataObj.append('image', selectedFile);
    }
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/games/ins`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAlert({ show: true, message: `Game "${formData.name}" created successfully`, variant: 'success' });
      setShowAddModal(false);
      fetchGames();
      fetchGameCount();
      setFormData({
        name: '',
        gameCode: '',
        providerCode: '',
        category: '',
        bet_amount: '100.00',
        status: 'active'
      });
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      setAlert({ show: true, message: 'Error creating game', variant: 'danger' });
      console.error('Error creating game:', error);
    }
  };
  
  // Submit update game form
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    formDataObj.append('name', updateData.name);
    formDataObj.append('gameCode', updateData.gameCode);
    formDataObj.append('providerCode', updateData.providerCode);
    formDataObj.append('category', updateData.category);
    formDataObj.append('bet_amount', updateData.bet_amount);
    
    if (selectedFile) {
      formDataObj.append('image', selectedFile);
    }
    
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/games/${updateData.id}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAlert({ show: true, message: `Game "${updateData.name}" updated successfully`, variant: 'success' });
      setShowUpdateModal(false);
      fetchGames();
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      setAlert({ show: true, message: 'Error updating game', variant: 'danger' });
      console.error('Error updating game:', error);
    }
  };
  
  // Reset filters and search
  const resetFilters = () => {
    setFilters({ category: '', status: '' });
    setSearchTerm('');
  };
  
  // Open view modal for a game
  const openViewModal = (game) => {
    setSelectedGame(game);
    setShowViewModal(true);
  };
  
  // Open update modal for a game
  const openUpdateModal = (game) => {
    setUpdateData({
      id: game.id,
      name: game.name,
      gameCode: game.gameCode || '',
      providerCode: game.providerCode || '',
      category: game.category,
      bet_amount: game.bet_amount,
      image_url: game.image_url
    });
    setShowUpdateModal(true);
  };
  
  // Handle game status toggle
  const toggleGameStatus = async (gameId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`${process.env.REACT_APP_API_URL}/api/games/${gameId}/status`, { status: newStatus });
      setAlert({ show: true, message: `Game ${newStatus} successfully`, variant: 'success' });
      fetchGames(); // Refresh games list
    } catch (error) {
      console.error('Error updating game status:', error);
      setAlert({ show: true, message: 'Error updating game status', variant: 'danger' });
    }
  };
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGames.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
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
          
          .image-preview-container {
            position: relative;
            display: inline-block;
          }
          
          .remove-image {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
        }
        
        .dual-color-title {
          background: linear-gradient(45deg, #28a745, #ffc107);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
        }
        
        .currency-symbol {
          color: #ffc107;
          font-weight: bold;
        }
      `}</style>
      
      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}
      
      {/* Title with dual color */}
      <h1 className="text-center mb-4">
        <span className="dual-color-title">Game Management</span>
      </h1>
      
      {/* Add Game Button and Game Count */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <Button 
          variant="success" 
          className="d-flex align-items-center mb-2 mb-md-0"
          style={{ background: 'linear-gradient(45deg, #28a745, #ffc107)', border: 'none', color: '#ffffff' }}
          onClick={() => setShowAddModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          <span className="d-none d-sm-inline">Add Game</span>
        </Button>
        <Button variant="outline-light">
          <FontAwesomeIcon icon={faGamepad} className="me-2" />
          Total Games: {gameCount}
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3 mb-md-0">
          <div className="d-flex flex-wrap">
            <div className="me-2 mb-2 flex-grow-1" style={{ minWidth: '120px' }}>
              <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="slots">Slots</option>
                <option value="table">Table</option>
                <option value="casino">Casino</option>
                <option value="card">Card</option>
                <option value="number">Number</option>
                <option value="tournaments">Tournaments</option>
              </Form.Select>
            </div>
            <div className="me-2 mb-2 flex-grow-1" style={{ minWidth: '120px' }}>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              placeholder="Search by ID, name, category or codes"
              value={searchTerm}
              onChange={handleSearch}
              className="bg-dark text-light"
            />
          </div>
        </div>
      </div>
      
      {/* Games Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
            <p className="mt-2 text-warning">Loading games...</p>
          </div>
        ) : (
          <>
            <Table striped bordered hover variant="dark" className="mobile-table">
              <thead>
                <tr>
                  <th className="d-none d-md-table-cell">ID</th>
                  <th>Name</th>
                  <th className="d-none d-sm-table-cell">Category</th>
                  <th>Bet Amount</th>
                  <th className="d-none d-md-table-cell">Game Code</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map(game => (
                  <tr key={game.id}>
                    <td className="d-none d-md-table-cell">{game.id}</td>
                    <td>
                      {game.name}
                      {game.gameCode && <div className="small text-muted">Code: {game.gameCode}</div>}
                    </td>
                    <td className="d-none d-sm-table-cell">{game.category}</td>
                    <td>
                      <span className="currency-symbol">₹</span>{game.bet_amount}
                    </td>
                    <td className="d-none d-md-table-cell">{game.gameCode || '-'}</td>
                    <td>
                      <Badge bg={game.status === 'active' ? 'success' : 'danger'}>
                        {game.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => openViewModal(game)}
                        className="me-1"
                      >
                        <FontAwesomeIcon icon={faEye} /> <span className="d-none d-sm-inline">View</span>
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => openUpdateModal(game)}
                        className="me-1"
                      >
                        <FontAwesomeIcon icon={faEdit} /> <span className="d-none d-sm-inline">Update</span>
                      </Button>
                      <Button
                        variant={game.status === 'active' ? 'warning' : 'success'}
                        size="sm"
                        onClick={() => toggleGameStatus(game.id, game.status)}
                        title={game.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <FontAwesomeIcon icon={game.status === 'active' ? faToggleOff : faToggleOn} />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      No games found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            
            {/* Pagination Controls */}
            {filteredGames.length > itemsPerPage && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredGames.length)} of {filteredGames.length} entries
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
      
      {/* Add Game Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faGamepad} className="me-2" />
            Add New Game
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faGamepad} className="me-2" />
                Game Name
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
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FontAwesomeIcon icon={faIdCard} className="me-2" />
                    Game Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="gameCode"
                    value={formData.gameCode}
                    onChange={handleInputChange}
                    placeholder="Enter game code"
                    className="bg-dark text-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FontAwesomeIcon icon={faIdCard} className="me-2" />
                    Provider Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="providerCode"
                    value={formData.providerCode}
                    onChange={handleInputChange}
                    placeholder="Enter provider code"
                    className="bg-dark text-light"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faTag} className="me-2" />
                Category
              </Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="bg-dark text-light"
              >
                <option value="">Select Category</option>
                <option value="slots">Slots</option>
                <option value="table">Table</option>
                <option value="casino">Casino</option>
                <option value="card">Card</option>
                <option value="number">Number</option>
                <option value="tournaments">Tournaments</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                Bet Amount (<span className="currency-symbol">₹</span>)
              </Form.Label>
              <Form.Control
                type="number"
                name="bet_amount"
                value={formData.bet_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                required
                className="bg-dark text-light"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Game Image
              </Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="bg-dark text-light me-2"
                />
                <FontAwesomeIcon icon={faUpload} className="text-warning" />
              </div>
              
              {preview && (
                <div className="mt-3 image-preview-container">
                  <Image src={preview} thumbnail style={{ maxHeight: '150px' }} />
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="remove-image"
                    onClick={handleRemoveImage}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faToggleOn} className="me-2" />
                Status
              </Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="bg-dark text-light"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Add Game
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* View Game Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-success text-light">
          <Modal.Title>
            <FontAwesomeIcon icon={faGamepad} className="me-2" />
            {selectedGame ? `${selectedGame.name} (ID: ${selectedGame.id})` : 'Game Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedGame && (
            <div>
              <h5 className="text-warning">Game Details</h5>
              <Row className="mb-2">
                <Col sm={4}><strong>ID:</strong></Col>
                <Col sm={8}>{selectedGame.id}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Name:</strong></Col>
                <Col sm={8}>{selectedGame.name}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Game Code:</strong></Col>
                <Col sm={8}>{selectedGame.gameCode || 'Not provided'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Provider Code:</strong></Col>
                <Col sm={8}>{selectedGame.providerCode || 'Not provided'}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Category:</strong></Col>
                <Col sm={8}>{selectedGame.category}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Bet Amount:</strong></Col>
                <Col sm={8}><span className="currency-symbol">₹</span>{selectedGame.bet_amount}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>RPT:</strong></Col>
                <Col sm={8}><span className="currency-symbol">₹</span>{selectedGame.rpt}</Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Status:</strong></Col>
                <Col sm={8}>
                  <Badge bg={selectedGame.status === 'active' ? 'success' : 'danger'}>
                    {selectedGame.status}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Game Image:</strong></Col>
                <Col sm={8}>
                  {selectedGame.image_url ? (
                    <Image 
                      src={selectedGame.image_url} 
                      thumbnail 
                      style={{ maxHeight: '150px' }} 
                    />
                  ) : (
                    <p>No image provided</p>
                  )}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col sm={4}><strong>Created At:</strong></Col>
                <Col sm={8}>{new Date(selectedGame.created_at).toLocaleString()}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="warning" onClick={() => openUpdateModal(selectedGame)}>
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Update Game
          </Button>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Update Game Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Update Game
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form onSubmit={handleUpdateSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faGamepad} className="me-2" />
                Game Name
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={updateData.name}
                onChange={handleUpdateChange}
                required
                className="bg-dark text-light"
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FontAwesomeIcon icon={faIdCard} className="me-2" />
                    Game Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="gameCode"
                    value={updateData.gameCode}
                    onChange={handleUpdateChange}
                    className="bg-dark text-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FontAwesomeIcon icon={faIdCard} className="me-2" />
                    Provider Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="providerCode"
                    value={updateData.providerCode}
                    onChange={handleUpdateChange}
                    className="bg-dark text-light"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faTag} className="me-2" />
                Category
              </Form.Label>
              <Form.Select
                name="category"
                value={updateData.category}
                onChange={handleUpdateChange}
                required
                className="bg-dark text-light"
              >
                <option value="">Select Category</option>
                <option value="slots">Slots</option>
                <option value="table">Table</option>
                <option value="casino">Casino</option>
                <option value="card">Card</option>
                <option value="number">Number</option>
                <option value="tournaments">Tournaments</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                Bet Amount (<span className="currency-symbol">₹</span>)
              </Form.Label>
              <Form.Control
                type="number"
                name="bet_amount"
                value={updateData.bet_amount}
                onChange={handleUpdateChange}
                step="0.01"
                min="0.01"
                required
                className="bg-dark text-light"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Game Image
              </Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="bg-dark text-light me-2"
                />
                <FontAwesomeIcon icon={faUpload} className="text-warning" />
              </div>
              
              {preview ? (
                <div className="mt-3 image-preview-container">
                  <Image src={preview} thumbnail style={{ maxHeight: '150px' }} />
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="remove-image"
                    onClick={handleRemoveImage}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </div>
              ) : updateData.image_url ? (
                <div className="mt-3">
                   {/* Now directly use the stored S3 URL */}
                 <Image 
                    src={updateData.image_url} 
                    thumbnail 
                    style={{ maxHeight: '150px' }} 
                  />
                </div>
              ) : (
                <p className="mt-2 text-muted">No image selected</p>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowUpdateModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="warning">
                Update Game
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GameManagement;