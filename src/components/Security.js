// security.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, faKey, faUserShield, faLock, faSearch, 
  faFilter, faEye, faBan, faExclamationTriangle, faCheckCircle,
  faChevronLeft, faChevronRight, faSave, faEdit, faUserCog,
  faNetworkWired, faDatabase, faUserSecret, faServer, faGlobe,
  faPlus, faTimes, faSync, faFingerprint, faIdCard, faFileAlt,
  faUserClock, faUserLock, faLaptopCode, faCertificate, faHistory,
  faChartLine, faExclamationCircle, faUserTie, faGraduationCap,
  faCogs, faPlug, faCloud, faKeycdn, faUserSlash, faUserCheck,
  faPassport, faMoneyCheck, faVirusSlash, faShieldVirus, faUserShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Alert, Table, Dropdown, Badge, Spinner, Nav, Row, Col, Card, ToggleButtonGroup, ToggleButton, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const Security = () => {
  // State declarations
  const [securitySettings, setSecuritySettings] = useState({
    accessControls: {
      mfaEnabled: true,
      passwordPolicy: {
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        passwordExpiryDays: 90,
        preventReuse: 5
      },
      rbacEnabled: true,
      ipRestriction: {
        enabled: true,
        allowedIPs: ['192.168.1.1', '10.0.0.1'],
        vpnRequired: true
      },
      separateAdminDomain: true,
      sessionTimeout: 30
    },
    monitoring: {
      activityLogging: true,
      suspiciousActivityAlerts: true,
      securityAudits: {
        enabled: true,
        frequency: 'quarterly',
        lastAuditDate: '2025-08-28'
      },
      failedLoginThreshold: 0,
      lockoutDuration: 15
    },
    dataProtection: {
      encryptionInTransit: true,
      encryptionAtRest: true,
      credentialHashing: true,
      kycEnabled: true,
      dataRetention: 365,
      backupEnabled: true,
      backupFrequency: 'daily'
    },
    operational: {
      incidentResponsePlan: true,
      staffTraining: {
        enabled: true,
        frequency: 'quarterly',
        lastTrainingDate: '2025-08-20'
      },
      privilegeManagement: true,
      superAdminCount: 2,
      incidentReporting: true
    },
    technological: {
      wafEnabled: true,
      softwareUpdates: true,
      secureAPIs: true,
      apiRateLimiting: true,
      corsEnabled: true,
      csrfProtection: true,
      serverHardening: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [activeTab, setActiveTab] = useState('accessControls');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newIP, setNewIP] = useState('');
  const [showIPModal, setShowIPModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // API base URL
 const API_URL = `${process.env.REACT_APP_API_URL}/api/security`;

  
  // Fetch security settings on component mount
  useEffect(() => {
    fetchSecuritySettings();
  }, []);
  
  // Fetch security settings from API
  const fetchSecuritySettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSecuritySettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      setAlert({ show: true, message: 'Error fetching security settings', variant: 'danger' });
      setLoading(false);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (setting, data) => {
    setCurrentSetting(setting);
    setEditFormData(JSON.parse(JSON.stringify(data))); // Deep clone
    setShowEditModal(true);
  };
  
  // Handle form input changes in edit modal
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setEditFormData({
        ...editFormData,
        [parent]: {
          ...editFormData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Submit edited settings
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/settings/${currentSetting}`, editFormData);
      
      // Update local state
      setSecuritySettings({
        ...securitySettings,
        [currentSetting]: response.data.data
      });
      
      setAlert({ show: true, message: 'Security settings updated successfully', variant: 'success' });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating security settings:', error);
      setAlert({ show: true, message: 'Error updating security settings', variant: 'danger' });
    }
  };
  
  // Toggle MFA status
  const toggleMFA = async () => {
    try {
      const newStatus = !securitySettings.accessControls.mfaEnabled;
      const updatedSettings = {
        ...securitySettings.accessControls,
        mfaEnabled: newStatus
      };
      
      const response = await axios.put(`${API_URL}/settings/accessControls`, updatedSettings);
      
      // Update local state
      setSecuritySettings({
        ...securitySettings,
        accessControls: response.data.data
      });
      
      setAlert({ 
        show: true, 
        message: `MFA ${newStatus ? 'enabled' : 'disabled'} successfully`, 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Error toggling MFA:', error);
      setAlert({ show: true, message: 'Error updating MFA status', variant: 'danger' });
    }
  };
  
  // Add IP to whitelist
  const handleAddIP = async () => {
    try {
      const response = await axios.post(`${API_URL}/settings/accessControls/ip`, { ip: newIP });
      
      // Update local state
      setSecuritySettings({
        ...securitySettings,
        accessControls: {
          ...securitySettings.accessControls,
          ipRestriction: {
            ...securitySettings.accessControls.ipRestriction,
            allowedIPs: response.data.data.allowedIPs
          }
        }
      });
      
      setAlert({ show: true, message: 'IP added to whitelist', variant: 'success' });
      setNewIP('');
      setShowIPModal(false);
    } catch (error) {
      console.error('Error adding IP to whitelist:', error);
      setAlert({ show: true, message: error.response?.data?.message || 'Error adding IP to whitelist', variant: 'danger' });
    }
  };
  
  // Remove IP from whitelist
  const removeIPFromWhitelist = async (ip) => {
    if (window.confirm(`Are you sure you want to remove ${ip} from the whitelist?`)) {
      try {
        const response = await axios.delete(`${API_URL}/settings/accessControls/ip/${ip}`);
        
        // Update local state
        setSecuritySettings({
          ...securitySettings,
          accessControls: {
            ...securitySettings.accessControls,
            ipRestriction: {
              ...securitySettings.accessControls.ipRestriction,
              allowedIPs: response.data.data.allowedIPs
            }
          }
        });
        
        setAlert({ show: true, message: 'IP removed from whitelist', variant: 'success' });
      } catch (error) {
        console.error('Error removing IP from whitelist:', error);
        setAlert({ show: true, message: error.response?.data?.message || 'Error removing IP from whitelist', variant: 'danger' });
      }
    }
  };
  
  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await axios.get(`${API_URL}/audit-logs`);
      setAuditLogs(response.data);
      setLoadingLogs(false);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAlert({ show: true, message: 'Error fetching audit logs', variant: 'danger' });
      setLoadingLogs(false);
    }
  };
  
  // Open audit logs modal
  const openAuditModal = () => {
    setShowAuditModal(true);
    fetchAuditLogs();
  };
  
  // Mobile view component for security settings
  const MobileSecurityView = ({ settings, section }) => {
    return (
      <div className="mobile-security-section">
        {section === 'accessControls' && (
          <>
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faFingerprint} className="me-2" />
                <span>Multi-Factor Authentication</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.mfaEnabled ? "success" : "danger"} className="mobile-badge">
                  {settings.mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button 
                  variant={settings.mfaEnabled ? "outline-danger" : "outline-success"} 
                  size="sm" 
                  className="mobile-button ms-2"
                  onClick={toggleMFA}
                >
                  {settings.mfaEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faKey} className="me-2" />
                <span>Password Policy</span>
              </div>
              <div className="mobile-item-content">
                <div className="mobile-policy-item">
                  <span>Min Length:</span>
                  <Badge bg="info" className="mobile-badge">
                    {settings.passwordPolicy.minLength} chars
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>Special Chars:</span>
                  <Badge bg={settings.passwordPolicy.requireSpecialChars ? "success" : "danger"} className="mobile-badge">
                    {settings.passwordPolicy.requireSpecialChars ? "Required" : "Not Required"}
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>Numbers:</span>
                  <Badge bg={settings.passwordPolicy.requireNumbers ? "success" : "danger"} className="mobile-badge">
                    {settings.passwordPolicy.requireNumbers ? "Required" : "Not Required"}
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>Uppercase:</span>
                  <Badge bg={settings.passwordPolicy.requireUppercase ? "success" : "danger"} className="mobile-badge">
                    {settings.passwordPolicy.requireUppercase ? "Required" : "Not Required"}
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>Expiry:</span>
                  <Badge bg="info" className="mobile-badge">
                    {settings.passwordPolicy.passwordExpiryDays} days
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faUserCog} className="me-2" />
                <span>Role-Based Access Control</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.rbacEnabled ? "success" : "danger"} className="mobile-badge">
                  {settings.rbacEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faNetworkWired} className="me-2" />
                <span>IP Restriction</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.ipRestriction.enabled ? "success" : "danger"} className="mobile-badge">
                  {settings.ipRestriction.enabled ? "Enabled" : "Disabled"}
                </Badge>
                {settings.ipRestriction.enabled && (
                  <>
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Allowed IPs:</span>
                        <Button variant="outline-success" size="sm" className="mobile-button" onClick={() => setShowIPModal(true)}>
                          <FontAwesomeIcon icon={faPlus} /> Add
                        </Button>
                      </div>
                      <div className="mobile-ip-list">
                        {settings.ipRestriction.allowedIPs.length > 0 ? (
                          settings.ipRestriction.allowedIPs.map((ip, index) => (
                            <div key={index} className="mobile-ip-item">
                              <span>{ip}</span>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="mobile-button"
                                onClick={() => removeIPFromWhitelist(ip)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">No IP addresses whitelisted</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge bg={settings.ipRestriction.vpnRequired ? "info" : "secondary"} className="mobile-badge">
                        VPN Required: {settings.ipRestriction.vpnRequired ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faGlobe} className="me-2" />
                <span>Separate Admin Domain</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.separateAdminDomain ? "success" : "danger"} className="mobile-badge">
                  {settings.separateAdminDomain ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faUserClock} className="me-2" />
                <span>Session Timeout</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg="info" className="mobile-badge">
                  {settings.sessionTimeout} minutes
                </Badge>
              </div>
            </div>
          </>
        )}
        
        {section === 'monitoring' && (
          <>
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faDatabase} className="me-2" />
                <span>Activity Logging</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.activityLogging ? "success" : "danger"} className="mobile-badge">
                  {settings.activityLogging ? "Enabled" : "Disabled"}
                </Badge>
                {settings.activityLogging && (
                  <Button variant="outline-info" size="sm" className="mobile-button ms-2" onClick={openAuditModal}>
                    <FontAwesomeIcon icon={faHistory} /> View Logs
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                <span>Suspicious Activity Alerts</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.suspiciousActivityAlerts ? "success" : "danger"} className="mobile-badge">
                  {settings.suspiciousActivityAlerts ? "Enabled" : "Disabled"}
                </Badge>
                {settings.suspiciousActivityAlerts && (
                  <div className="mt-2">
                    <div className="mobile-policy-item">
                      <span>Failed Login Threshold:</span>
                      <Badge bg="info" className="mobile-badge">
                        {settings.failedLoginThreshold} attempts
                      </Badge>
                    </div>
                    <div className="mobile-policy-item">
                      <span>Lockout Duration:</span>
                      <Badge bg="info" className="mobile-badge">
                        {settings.lockoutDuration} minutes
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faCertificate} className="me-2" />
                <span>Security Audits</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.securityAudits.enabled ? "success" : "danger"} className="mobile-badge">
                  {settings.securityAudits.enabled ? "Enabled" : "Disabled"}
                </Badge>
                {settings.securityAudits.enabled && (
                  <div className="mt-2">
                    <div className="mobile-policy-item">
                      <span>Frequency:</span>
                      <Badge bg="info" className="mobile-badge">
                        {settings.securityAudits.frequency}
                      </Badge>
                    </div>
                    <div className="mobile-policy-item">
                      <span>Last Audit:</span>
                      <Badge bg="info" className="mobile-badge">
                        {settings.securityAudits.lastAuditDate}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {section === 'dataProtection' && (
          <>
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faLock} className="me-2" />
                <span>Encryption</span>
              </div>
              <div className="mobile-item-content">
                <div className="mobile-policy-item">
                  <span>In Transit:</span>
                  <Badge bg={settings.encryptionInTransit ? "success" : "danger"} className="mobile-badge">
                    {settings.encryptionInTransit ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>At Rest:</span>
                  <Badge bg={settings.encryptionAtRest ? "success" : "danger"} className="mobile-badge">
                    {settings.encryptionAtRest ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faKey} className="me-2" />
                <span>Credential Safeguarding</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.credentialHashing ? "success" : "danger"} className="mobile-badge">
                  {settings.credentialHashing ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faIdCard} className="me-2" />
                <span>KYC and Fraud Prevention</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.kycEnabled ? "success" : "danger"} className="mobile-badge">
                  {settings.kycEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                <span>Data Retention</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg="info" className="mobile-badge">
                  {settings.dataRetention} days
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faCloud} className="me-2" />
                <span>Backup and Recovery</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.backupEnabled ? "success" : "danger"} className="mobile-badge">
                  {settings.backupEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {settings.backupEnabled && (
                  <div className="mt-2">
                    <Badge bg="info" className="mobile-badge">
                      Frequency: {settings.backupFrequency}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {section === 'operational' && (
          <>
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                <span>Incident Response Plan</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.incidentResponsePlan ? "success" : "danger"} className="mobile-badge">
                  {settings.incidentResponsePlan ? "Exists" : "Not Created"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                <span>Staff Training</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.staffTraining.enabled ? "success" : "danger"} className="mobile-badge">
                  {settings.staffTraining.enabled ? "Enabled" : "Disabled"}
                </Badge>
                {settings.staffTraining.enabled && (
                  <div className="mt-2">
                    <div className="mobile-policy-item">
                      <span>Frequency:</span>
                      <Badge bg="info" className="mobile-badge">
                        {settings.staffTraining.frequency}
                      </Badge>
                    </div>
                    <div className="mobile-policy-item">
                      <span>Last Training:</span>
                      <Badge bg="info" className="mobile-badge">
                        {settings.staffTraining.lastTrainingDate}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faUserLock} className="me-2" />
                <span>Privilege Management</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.privilegeManagement ? "success" : "danger"} className="mobile-badge">
                  {settings.privilegeManagement ? "Enabled" : "Disabled"}
                </Badge>
                {settings.privilegeManagement && (
                  <div className="mt-2">
                    <Badge bg="info" className="mobile-badge">
                      Super Admins: {settings.superAdminCount}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                <span>Incident Reporting</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.incidentReporting ? "success" : "danger"} className="mobile-badge">
                  {settings.incidentReporting ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </>
        )}
        
        {section === 'technological' && (
          <>
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faShieldVirus} className="me-2" />
                <span>Web Application Firewall</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.wafEnabled ? "success" : "danger"} className="mobile-badge">
                  {settings.wafEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faSync} className="me-2" />
                <span>Software Updates</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.softwareUpdates ? "success" : "danger"} className="mobile-badge">
                  {settings.softwareUpdates ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faPlug} className="me-2" />
                <span>Secure APIs</span>
              </div>
              <div className="mobile-item-content">
                <div className="mobile-policy-item">
                  <span>API Security:</span>
                  <Badge bg={settings.secureAPIs ? "success" : "danger"} className="mobile-badge">
                    {settings.secureAPIs ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>Rate Limiting:</span>
                  <Badge bg={settings.apiRateLimiting ? "success" : "danger"} className="mobile-badge">
                    {settings.apiRateLimiting ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faLaptopCode} className="me-2" />
                <span>Application Security</span>
              </div>
              <div className="mobile-item-content">
                <div className="mobile-policy-item">
                  <span>CORS:</span>
                  <Badge bg={settings.corsEnabled ? "success" : "danger"} className="mobile-badge">
                    {settings.corsEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="mobile-policy-item">
                  <span>CSRF Protection:</span>
                  <Badge bg={settings.csrfProtection ? "success" : "danger"} className="mobile-badge">
                    {settings.csrfProtection ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mobile-item">
              <div className="mobile-item-header">
                <FontAwesomeIcon icon={faCogs} className="me-2" />
                <span>Server Hardening</span>
              </div>
              <div className="mobile-item-content">
                <Badge bg={settings.serverHardening ? "success" : "danger"} className="mobile-badge">
                  {settings.serverHardening ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Mobile view for audit logs
  const MobileAuditLogs = ({ logs }) => {
    return (
      <div className="mobile-audit-logs">
        {logs.map(log => (
          <div key={log.id} className="mobile-audit-item">
            <div className="mobile-audit-header">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <span>{log.action}</span>
            </div>
            <div className="mobile-audit-details">
              <div className="mobile-audit-detail">
                <span className="mobile-audit-label">User:</span>
                <span>{log.user}</span>
              </div>
              <div className="mobile-audit-detail">
                <span className="mobile-audit-label">Time:</span>
                <span>{log.timestamp}</span>
              </div>
              <div className="mobile-audit-detail">
                <span className="mobile-audit-label">IP:</span>
                <span>{log.ip}</span>
              </div>
            </div>
            <div className="mobile-audit-footer">
              <Badge bg={log.result === 'Success' ? 'success' : 'danger'} className="mobile-badge">
                {log.result}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Custom styles for mobile responsiveness
  const customStyles = `
    @media (max-width: 768px) {
      .security-card {
        margin-bottom: 1rem;
      }
      
      .nav-tabs {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        border-bottom: 1px solid #444;
        margin-bottom: 1rem;
      }
      
      .nav-tabs::-webkit-scrollbar {
        display: none;
      }
      
      .nav-tabs .nav-item {
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
      
      .modal-dialog {
        margin: 0;
        max-width: 100%;
        width: 90%;
        margin-left: 5%;
        margin-right: 5%;
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
      
      .security-table {
        font-size: 0.8rem;
      }
      
      .security-table th, .security-table td {
        padding: 0.5rem;
      }
      
      .mobile-security-section {
        margin-top: 1rem;
      }
      
      .mobile-item {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .mobile-item-header {
        display: flex;
        align-items: center;
        font-weight: 500;
        margin-bottom: 0.75rem;
        font-size: 1rem;
      }
      
      .mobile-item-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .mobile-policy-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .mobile-badge {
        font-size: 0.75rem;
      }
      
      .mobile-button {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }
      
      .mobile-ip-list {
        max-height: 150px;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 0.25rem;
        padding: 0.5rem;
      }
      
      .mobile-ip-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .mobile-ip-item:last-child {
        border-bottom: none;
      }
      
      .mobile-audit-logs {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .mobile-audit-item {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .mobile-audit-header {
        display: flex;
        align-items: center;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      
      .mobile-audit-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
      }
      
      .mobile-audit-detail {
        display: flex;
        justify-content: space-between;
      }
      
      .mobile-audit-label {
        color: #aaa;
        font-size: 0.85rem;
      }
      
      .mobile-audit-footer {
        display: flex;
        justify-content: flex-end;
      }
    }
  `;
  
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#1a1a1a', color: '#ffffff', minHeight: '100vh' }}>
      <style>{customStyles}</style>
      
      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}
      
      {/* Title */}
      <h1 className="text-center mb-4 text-warning">
        <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
        Security Settings
      </h1>
      
      {/* Security Overview Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card bg="dark" text="light" className="security-card h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faUserShield} size="2x" className="text-warning mb-2" />
              <Card.Title>Access Controls</Card.Title>
              <Card.Text>
                <Badge bg={securitySettings.accessControls.mfaEnabled ? "success" : "danger"}>
                  MFA: {securitySettings.accessControls.mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <br />
                <Badge bg={securitySettings.accessControls.rbacEnabled ? "success" : "danger"}>
                  RBAC: {securitySettings.accessControls.rbacEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card bg="dark" text="light" className="security-card h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-warning mb-2" />
              <Card.Title>Monitoring</Card.Title>
              <Card.Text>
                <Badge bg={securitySettings.monitoring.activityLogging ? "success" : "danger"}>
                  Logging: {securitySettings.monitoring.activityLogging ? "Enabled" : "Disabled"}
                </Badge>
                <br />
                <Badge bg={securitySettings.monitoring.suspiciousActivityAlerts ? "success" : "danger"}>
                  Alerts: {securitySettings.monitoring.suspiciousActivityAlerts ? "Enabled" : "Disabled"}
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card bg="dark" text="light" className="security-card h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faLock} size="2x" className="text-warning mb-2" />
              <Card.Title>Data Protection</Card.Title>
              <Card.Text>
                <Badge bg={securitySettings.dataProtection.encryptionInTransit ? "success" : "danger"}>
                  In Transit: {securitySettings.dataProtection.encryptionInTransit ? "Encrypted" : "Not Encrypted"}
                </Badge>
                <br />
                <Badge bg={securitySettings.dataProtection.encryptionAtRest ? "success" : "danger"}>
                  At Rest: {securitySettings.dataProtection.encryptionAtRest ? "Encrypted" : "Not Encrypted"}
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card bg="dark" text="light" className="security-card h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faServer} size="2x" className="text-warning mb-2" />
              <Card.Title>Technological</Card.Title>
              <Card.Text>
                <Badge bg={securitySettings.technological.wafEnabled ? "success" : "danger"}>
                  WAF: {securitySettings.technological.wafEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <br />
                <Badge bg={securitySettings.technological.softwareUpdates ? "success" : "danger"}>
                  Updates: {securitySettings.technological.softwareUpdates ? "Enabled" : "Disabled"}
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Security Settings Tabs */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item>
          <Nav.Link eventKey="accessControls">
            <FontAwesomeIcon icon={faUserShield} className="me-1" /> Access Controls
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="monitoring">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" /> Monitoring
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="dataProtection">
            <FontAwesomeIcon icon={faLock} className="me-1" /> Data Protection
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="operational">
            <FontAwesomeIcon icon={faUserSecret} className="me-1" /> Operational
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="technological">
            <FontAwesomeIcon icon={faServer} className="me-1" /> Technological
          </Nav.Link>
        </Nav.Item>
      </Nav>
      
      {/* Tab Content */}
      <div className="mt-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
            <p className="mt-2 text-warning">Loading security settings...</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="d-none d-md-block">
              {/* Access Controls Tab */}
              {activeTab === 'accessControls' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faUserShield} className="me-2" />
                    Access Controls and Authentication
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('accessControls', securitySettings.accessControls)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faFingerprint} className="me-2" />Multi-Factor Authentication</h5>
                        <p>Enforce MFA for all admin logins to ensure that even if a password is stolen, the account remains inaccessible without a secondary verification method.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">MFA Status:</span>
                          <Badge bg={securitySettings.accessControls.mfaEnabled ? "success" : "danger"}>
                            {securitySettings.accessControls.mfaEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button 
                            variant={securitySettings.accessControls.mfaEnabled ? "outline-danger" : "outline-success"} 
                            size="sm" 
                            className="ms-3"
                            onClick={toggleMFA}
                          >
                            {securitySettings.accessControls.mfaEnabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faKey} className="me-2" />Password Policy</h5>
                        <p>Mandate the use of strong, unique passwords that are changed regularly.</p>
                        <ul>
                          <li>Minimum Length: {securitySettings.accessControls.passwordPolicy.minLength} characters</li>
                          <li>Require Special Characters: {securitySettings.accessControls.passwordPolicy.requireSpecialChars ? "Yes" : "No"}</li>
                          <li>Require Numbers: {securitySettings.accessControls.passwordPolicy.requireNumbers ? "Yes" : "No"}</li>
                          <li>Require Uppercase: {securitySettings.accessControls.passwordPolicy.requireUppercase ? "Yes" : "No"}</li>
                          <li>Password Expiry: {securitySettings.accessControls.passwordPolicy.passwordExpiryDays} days</li>
                          <li>Prevent Reuse: Last {securitySettings.accessControls.passwordPolicy.preventReuse} passwords</li>
                        </ul>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faUserCog} className="me-2" />Role-Based Access Control</h5>
                        <p>Assign permissions based on an administrator's specific role, adhering to the principle of least privilege.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">RBAC Status:</span>
                          <Badge bg={securitySettings.accessControls.rbacEnabled ? "success" : "danger"}>
                            {securitySettings.accessControls.rbacEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faNetworkWired} className="me-2" />IP Restriction</h5>
                        <p>Allow admin logins only from a list of approved, static IP addresses.</p>
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-3">IP Restriction:</span>
                          <Badge bg={securitySettings.accessControls.ipRestriction.enabled ? "success" : "danger"}>
                            {securitySettings.accessControls.ipRestriction.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        {securitySettings.accessControls.ipRestriction.enabled && (
                          <>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6>Allowed IP Addresses:</h6>
                              <Button variant="outline-success" size="sm" onClick={() => setShowIPModal(true)}>
                                <FontAwesomeIcon icon={faPlus} /> Add IP
                              </Button>
                            </div>
                            <div className="border rounded p-2 bg-secondary bg-opacity-25" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              {securitySettings.accessControls.ipRestriction.allowedIPs.length > 0 ? (
                                <ul className="mb-0">
                                  {securitySettings.accessControls.ipRestriction.allowedIPs.map((ip, index) => (
                                    <li key={index} className="d-flex justify-content-between align-items-center">
                                      {ip}
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => removeIPFromWhitelist(ip)}
                                      >
                                        <FontAwesomeIcon icon={faTimes} />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted mb-0">No IP addresses whitelisted</p>
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge bg={securitySettings.accessControls.ipRestriction.vpnRequired ? "info" : "secondary"}>
                                VPN Required: {securitySettings.accessControls.ipRestriction.vpnRequired ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </>
                        )}
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faGlobe} className="me-2" />Separate Admin Domain</h5>
                        <p>Host the admin panel on a different domain or a private subnet, away from the public-facing application.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Separate Domain:</span>
                          <Badge bg={securitySettings.accessControls.separateAdminDomain ? "success" : "danger"}>
                            {securitySettings.accessControls.separateAdminDomain ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faUserClock} className="me-2" />Session Timeout</h5>
                        <p>Automatically log out inactive users after a period of time.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Timeout:</span>
                          <Badge bg="info">
                            {securitySettings.accessControls.sessionTimeout} minutes
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              
              {/* Monitoring Tab */}
              {activeTab === 'monitoring' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    Monitoring and Logging
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('monitoring', securitySettings.monitoring)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faDatabase} className="me-2" />Activity Logging</h5>
                        <p>Record all administrator activities, including logins, changes to user accounts, financial adjustments, and access to sensitive data.</p>
                        <div className="d-flex align-items-center mb-3">
                          <span className="me-3">Logging Status:</span>
                          <Badge bg={securitySettings.monitoring.activityLogging ? "success" : "danger"}>
                            {securitySettings.monitoring.activityLogging ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        {securitySettings.monitoring.activityLogging && (
                          <Button variant="outline-info" size="sm" onClick={openAuditModal}>
                            <FontAwesomeIcon icon={faHistory} /> View Audit Logs
                          </Button>
                        )}
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faExclamationCircle} className="me-2" />Suspicious Activity Alerts</h5>
                        <p>Set up automated alerts for unusual administrator behavior, such as multiple failed login attempts or actions performed outside of normal business hours.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Alert Status:</span>
                          <Badge bg={securitySettings.monitoring.suspiciousActivityAlerts ? "success" : "danger"}>
                            {securitySettings.monitoring.suspiciousActivityAlerts ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        {securitySettings.monitoring.suspiciousActivityAlerts && (
                          <div className="mt-2">
                            <Badge bg="info">
                              Failed Login Threshold: {securitySettings.monitoring.failedLoginThreshold} attempts
                            </Badge>
                            <Badge bg="info" className="ms-2">
                              Lockout Duration: {securitySettings.monitoring.lockoutDuration} minutes
                            </Badge>
                          </div>
                        )}
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <h5><FontAwesomeIcon icon={faCertificate} className="me-2" />Security Audits</h5>
                        <p>Perform routine, third-party security audits and penetration testing to identify and patch vulnerabilities.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Audit Status:</span>
                          <Badge bg={securitySettings.monitoring.securityAudits.enabled ? "success" : "danger"}>
                            {securitySettings.monitoring.securityAudits.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          {securitySettings.monitoring.securityAudits.enabled && (
                            <span className="ms-3">
                              Frequency: {securitySettings.monitoring.securityAudits.frequency} | 
                              Last Audit: {securitySettings.monitoring.securityAudits.lastAuditDate}
                            </span>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              
              {/* Data Protection Tab */}
              {activeTab === 'dataProtection' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Data Protection and Encryption
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('dataProtection', securitySettings.dataProtection)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faLock} className="me-2" />Encryption</h5>
                        <p>Ensure sensitive user and transaction data is encrypted both in transit and at rest.</p>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-3">In Transit (SSL/TLS):</span>
                            <Badge bg={securitySettings.dataProtection.encryptionInTransit ? "success" : "danger"}>
                              {securitySettings.dataProtection.encryptionInTransit ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-3">At Rest:</span>
                            <Badge bg={securitySettings.dataProtection.encryptionAtRest ? "success" : "danger"}>
                              {securitySettings.dataProtection.encryptionAtRest ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faKey} className="me-2" />Credential Safeguarding</h5>
                        <p>Never store passwords in plain text. Always use strong hashing and salting to protect login credentials.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Hashing Status:</span>
                          <Badge bg={securitySettings.dataProtection.credentialHashing ? "success" : "danger"}>
                            {securitySettings.dataProtection.credentialHashing ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faIdCard} className="me-2" />KYC and Fraud Prevention</h5>
                        <p>Feature robust Know Your Customer (KYC) and anti-fraud tools to verify user identities and prevent fraudulent transactions.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">KYC Status:</span>
                          <Badge bg={securitySettings.dataProtection.kycEnabled ? "success" : "danger"}>
                            {securitySettings.dataProtection.kycEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faFileAlt} className="me-2" />Data Retention</h5>
                        <p>Define how long user data is stored before being securely deleted.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Retention Period:</span>
                          <Badge bg="info">
                            {securitySettings.dataProtection.dataRetention} days
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <h5><FontAwesomeIcon icon={faCloud} className="me-2" />Backup and Recovery</h5>
                        <p>Regularly backup data to prevent loss in case of a security incident.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Backup Status:</span>
                          <Badge bg={securitySettings.dataProtection.backupEnabled ? "success" : "danger"}>
                            {securitySettings.dataProtection.backupEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          {securitySettings.dataProtection.backupEnabled && (
                            <span className="ms-3">
                              Frequency: {securitySettings.dataProtection.backupFrequency}
                            </span>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              
              {/* Operational Tab */}
              {activeTab === 'operational' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faUserSecret} className="me-2" />
                    Operational and Personnel Security
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('operational', securitySettings.operational)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faFileAlt} className="me-2" />Incident Response Plan</h5>
                        <p>Develop and document a clear plan for what to do in the event of a security breach.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Plan Status:</span>
                          <Badge bg={securitySettings.operational.incidentResponsePlan ? "success" : "danger"}>
                            {securitySettings.operational.incidentResponsePlan ? "Exists" : "Not Created"}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faGraduationCap} className="me-2" />Staff Training</h5>
                        <p>Provide recurring security training for all administrative personnel.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Training Status:</span>
                          <Badge bg={securitySettings.operational.staffTraining.enabled ? "success" : "danger"}>
                            {securitySettings.operational.staffTraining.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          {securitySettings.operational.staffTraining.enabled && (
                            <span className="ms-3">
                              Frequency: {securitySettings.operational.staffTraining.frequency} | 
                              Last Training: {securitySettings.operational.staffTraining.lastTrainingDate}
                            </span>
                          )}
                        </div>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faUserLock} className="me-2" />Privilege Management</h5>
                        <p>Reserve the ability to make high-impact changes to a very limited number of "super-admins".</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Management Status:</span>
                          <Badge bg={securitySettings.operational.privilegeManagement ? "success" : "danger"}>
                            {securitySettings.operational.privilegeManagement ? "Enabled" : "Disabled"}
                          </Badge>
                          {securitySettings.operational.privilegeManagement && (
                            <span className="ms-3">
                              Super Admins: {securitySettings.operational.superAdminCount}
                            </span>
                          )}
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faChartLine} className="me-2" />Incident Reporting</h5>
                        <p>Establish clear channels for reporting security incidents and potential vulnerabilities.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Reporting Status:</span>
                          <Badge bg={securitySettings.operational.incidentReporting ? "success" : "danger"}>
                            {securitySettings.operational.incidentReporting ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              
              {/* Technological Tab */}
              {activeTab === 'technological' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faServer} className="me-2" />
                    Technological Safeguards
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('technological', securitySettings.technological)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faShieldVirus} className="me-2" />Web Application Firewall</h5>
                        <p>A WAF can detect and block common attack vectors like SQL injection and cross-site scripting (XSS).</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">WAF Status:</span>
                          <Badge bg={securitySettings.technological.wafEnabled ? "success" : "danger"}>
                            {securitySettings.technological.wafEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faSync} className="me-2" />Software Updates</h5>
                        <p>Stay current on all software patches and updates for your operating systems, databases, and other tools.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Update Status:</span>
                          <Badge bg={securitySettings.technological.softwareUpdates ? "success" : "danger"}>
                            {securitySettings.technological.softwareUpdates ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faPlug} className="me-2" />Secure APIs</h5>
                        <p>Ensure APIs are securely authenticated, use rate-limiting, and have proper input validation.</p>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-3">API Security:</span>
                            <Badge bg={securitySettings.technological.secureAPIs ? "success" : "danger"}>
                              {securitySettings.technological.secureAPIs ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-3">Rate Limiting:</span>
                            <Badge bg={securitySettings.technological.apiRateLimiting ? "success" : "danger"}>
                              {securitySettings.technological.apiRateLimiting ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5><FontAwesomeIcon icon={faLaptopCode} className="me-2" />Application Security</h5>
                        <p>Implement security measures at the application level to protect against common vulnerabilities.</p>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-3">CORS:</span>
                            <Badge bg={securitySettings.technological.corsEnabled ? "success" : "danger"}>
                              {securitySettings.technological.corsEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-3">CSRF Protection:</span>
                            <Badge bg={securitySettings.technological.csrfProtection ? "success" : "danger"}>
                              {securitySettings.technological.csrfProtection ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={12}>
                        <h5><FontAwesomeIcon icon={faCogs} className="me-2" />Server Hardening</h5>
                        <p>Secure server configurations to minimize vulnerabilities and attack surfaces.</p>
                        <div className="d-flex align-items-center">
                          <span className="me-3">Hardening Status:</span>
                          <Badge bg={securitySettings.technological.serverHardening ? "success" : "danger"}>
                            {securitySettings.technological.serverHardening ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </div>
            
            {/* Mobile View */}
            <div className="d-md-none">
              {/* Access Controls Tab */}
              {activeTab === 'accessControls' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faUserShield} className="me-2" />
                    Access Controls and Authentication
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('accessControls', securitySettings.accessControls)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <MobileSecurityView settings={securitySettings.accessControls} section="accessControls" />
                  </Card.Body>
                </Card>
              )}
              
              {/* Monitoring Tab */}
              {activeTab === 'monitoring' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    Monitoring and Logging
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('monitoring', securitySettings.monitoring)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <MobileSecurityView settings={securitySettings.monitoring} section="monitoring" />
                  </Card.Body>
                </Card>
              )}
              
              {/* Data Protection Tab */}
              {activeTab === 'dataProtection' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Data Protection and Encryption
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('dataProtection', securitySettings.dataProtection)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <MobileSecurityView settings={securitySettings.dataProtection} section="dataProtection" />
                  </Card.Body>
                </Card>
              )}
              
              {/* Operational Tab */}
              {activeTab === 'operational' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faUserSecret} className="me-2" />
                    Operational and Personnel Security
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('operational', securitySettings.operational)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <MobileSecurityView settings={securitySettings.operational} section="operational" />
                  </Card.Body>
                </Card>
              )}
              
              {/* Technological Tab */}
              {activeTab === 'technological' && (
                <Card bg="dark" text="light">
                  <Card.Header>
                    <FontAwesomeIcon icon={faServer} className="me-2" />
                    Technological Safeguards
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="float-end"
                      onClick={() => handleEditClick('technological', securitySettings.technological)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <MobileSecurityView settings={securitySettings.technological} section="technological" />
                  </Card.Body>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Edit Settings Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>Edit Security Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            {currentSetting === 'accessControls' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="mfaEnabled"
                    name="mfaEnabled"
                    label="Enable Multi-Factor Authentication"
                    checked={editFormData.mfaEnabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="rbacEnabled"
                    name="rbacEnabled"
                    label="Enable Role-Based Access Control"
                    checked={editFormData.rbacEnabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="separateAdminDomain"
                    name="separateAdminDomain"
                    label="Use Separate Admin Domain"
                    checked={editFormData.separateAdminDomain || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Session Timeout (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="sessionTimeout"
                    value={editFormData.sessionTimeout || 30}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <h5 className="mt-4">Password Policy</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Password Length</Form.Label>
                  <Form.Control
                    type="number"
                    name="passwordPolicy.minLength"
                    value={editFormData.passwordPolicy?.minLength || 8}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="requireSpecialChars"
                    name="passwordPolicy.requireSpecialChars"
                    label="Require Special Characters"
                    checked={editFormData.passwordPolicy?.requireSpecialChars || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="requireNumbers"
                    name="passwordPolicy.requireNumbers"
                    label="Require Numbers"
                    checked={editFormData.passwordPolicy?.requireNumbers || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="requireUppercase"
                    name="passwordPolicy.requireUppercase"
                    label="Require Uppercase Letters"
                    checked={editFormData.passwordPolicy?.requireUppercase || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password Expiry (days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="passwordPolicy.passwordExpiryDays"
                    value={editFormData.passwordPolicy?.passwordExpiryDays || 90}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Prevent Reuse of Last</Form.Label>
                  <Form.Control
                    type="number"
                    name="passwordPolicy.preventReuse"
                    value={editFormData.passwordPolicy?.preventReuse || 5}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <h5 className="mt-4">IP Restriction</h5>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="ipRestrictionEnabled"
                    name="ipRestriction.enabled"
                    label="Enable IP Restriction"
                    checked={editFormData.ipRestriction?.enabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                {editFormData.ipRestriction?.enabled && (
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="vpnRequired"
                      name="ipRestriction.vpnRequired"
                      label="Require VPN Connection"
                      checked={editFormData.ipRestriction?.vpnRequired || false}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                )}
              </>
            )}
            
            {currentSetting === 'monitoring' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="activityLogging"
                    name="activityLogging"
                    label="Enable Activity Logging"
                    checked={editFormData.activityLogging || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="suspiciousActivityAlerts"
                    name="suspiciousActivityAlerts"
                    label="Enable Suspicious Activity Alerts"
                    checked={editFormData.suspiciousActivityAlerts || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                {editFormData.suspiciousActivityAlerts && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Failed Login Threshold</Form.Label>
                      <Form.Control
                        type="number"
                        name="failedLoginThreshold"
                        value={editFormData.failedLoginThreshold || 5}
                        onChange={handleEditInputChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Lockout Duration (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="lockoutDuration"
                        value={editFormData.lockoutDuration || 15}
                        onChange={handleEditInputChange}
                      />
                    </Form.Group>
                  </>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="securityAuditsEnabled"
                    name="securityAudits.enabled"
                    label="Enable Security Audits"
                    checked={editFormData.securityAudits?.enabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                {editFormData.securityAudits?.enabled && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Audit Frequency</Form.Label>
                      <Form.Select
                        name="securityAudits.frequency"
                        value={editFormData.securityAudits?.frequency || 'quarterly'}
                        onChange={handleEditInputChange}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="biannually">Biannually</option>
                        <option value="annually">Annually</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Last Audit Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="securityAudits.lastAuditDate"
                        value={editFormData.securityAudits?.lastAuditDate || ''}
                        onChange={handleEditInputChange}
                      />
                    </Form.Group>
                  </>
                )}
              </>
            )}
            
            {currentSetting === 'dataProtection' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="encryptionInTransit"
                    name="encryptionInTransit"
                    label="Enable Encryption In Transit (SSL/TLS)"
                    checked={editFormData.encryptionInTransit || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="encryptionAtRest"
                    name="encryptionAtRest"
                    label="Enable Encryption At Rest"
                    checked={editFormData.encryptionAtRest || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="credentialHashing"
                    name="credentialHashing"
                    label="Enable Credential Hashing"
                    checked={editFormData.credentialHashing || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="kycEnabled"
                    name="kycEnabled"
                    label="Enable KYC and Fraud Prevention"
                    checked={editFormData.kycEnabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Data Retention Period (days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="dataRetention"
                    value={editFormData.dataRetention || 365}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="backupEnabled"
                    name="backupEnabled"
                    label="Enable Data Backup"
                    checked={editFormData.backupEnabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                {editFormData.backupEnabled && (
                  <Form.Group className="mb-3">
                    <Form.Label>Backup Frequency</Form.Label>
                    <Form.Select
                      name="backupFrequency"
                      value={editFormData.backupFrequency || 'daily'}
                      onChange={handleEditInputChange}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}
            
            {currentSetting === 'operational' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="incidentResponsePlan"
                    name="incidentResponsePlan"
                    label="Incident Response Plan Exists"
                    checked={editFormData.incidentResponsePlan || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="staffTrainingEnabled"
                    name="staffTraining.enabled"
                    label="Enable Staff Training"
                    checked={editFormData.staffTraining?.enabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                {editFormData.staffTraining?.enabled && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Training Frequency</Form.Label>
                      <Form.Select
                        name="staffTraining.frequency"
                        value={editFormData.staffTraining?.frequency || 'quarterly'}
                        onChange={handleEditInputChange}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="biannually">Biannually</option>
                        <option value="annually">Annually</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Last Training Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="staffTraining.lastTrainingDate"
                        value={editFormData.staffTraining?.lastTrainingDate || ''}
                        onChange={handleEditInputChange}
                      />
                    </Form.Group>
                  </>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="privilegeManagement"
                    name="privilegeManagement"
                    label="Enable Privilege Management"
                    checked={editFormData.privilegeManagement || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                {editFormData.privilegeManagement && (
                  <Form.Group className="mb-3">
                    <Form.Label>Number of Super Admins</Form.Label>
                    <Form.Control
                      type="number"
                      name="superAdminCount"
                      value={editFormData.superAdminCount || 2}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="incidentReporting"
                    name="incidentReporting"
                    label="Enable Incident Reporting"
                    checked={editFormData.incidentReporting || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </>
            )}
            
            {currentSetting === 'technological' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="wafEnabled"
                    name="wafEnabled"
                    label="Enable Web Application Firewall"
                    checked={editFormData.wafEnabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="softwareUpdates"
                    name="softwareUpdates"
                    label="Enable Automatic Software Updates"
                    checked={editFormData.softwareUpdates || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="secureAPIs"
                    name="secureAPIs"
                    label="Enable Secure APIs"
                    checked={editFormData.secureAPIs || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="apiRateLimiting"
                    name="apiRateLimiting"
                    label="Enable API Rate Limiting"
                    checked={editFormData.apiRateLimiting || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="corsEnabled"
                    name="corsEnabled"
                    label="Enable CORS"
                    checked={editFormData.corsEnabled || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="csrfProtection"
                    name="csrfProtection"
                    label="Enable CSRF Protection"
                    checked={editFormData.csrfProtection || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="serverHardening"
                    name="serverHardening"
                    label="Enable Server Hardening"
                    checked={editFormData.serverHardening || false}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </>
            )}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="warning">
                <FontAwesomeIcon icon={faSave} /> Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Add IP Modal */}
      <Modal show={showIPModal} onHide={() => setShowIPModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>Add IP to Whitelist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>IP Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowIPModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="success" onClick={handleAddIP}>
                <FontAwesomeIcon icon={faPlus} /> Add IP
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Audit Logs Modal */}
      <Modal show={showAuditModal} onHide={() => setShowAuditModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FontAwesomeIcon icon={faHistory} className="me-2" />
            Audit Logs
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {loadingLogs ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="warning" />
              <p className="mt-2 text-warning">Loading audit logs...</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="d-none d-md-block">
                <Table striped bordered hover variant="dark" className="security-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>IP Address</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td>{log.timestamp}</td>
                        <td>{log.user}</td>
                        <td>{log.action}</td>
                        <td>{log.ip}</td>
                        <td>
                          <Badge bg={log.result === 'Success' ? 'success' : 'danger'}>
                            {log.result}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Mobile View */}
              <div className="d-md-none">
                <MobileAuditLogs logs={auditLogs} />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowAuditModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Security;