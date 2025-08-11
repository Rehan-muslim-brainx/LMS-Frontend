import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [otpStep, setOtpStep] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    testConnectivity(); // Add connectivity test
  }, []);

  const testConnectivity = async () => {
    try {
      console.log('Testing backend connectivity...');
      const response = await fetch(buildApiUrl(getEndpoint('TEST')));
      const data = await response.json();
      console.log('Backend connectivity test successful:', data);
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      showAlert('Cannot connect to server. Please check if the backend is running.', 'danger');
    }
  };

  // Update available roles when department changes
  useEffect(() => {
    if (formData.department) {
      const selectedDepartment = departments.find(dept => dept.name === formData.department);
      setAvailableRoles(selectedDepartment ? selectedDepartment.roles : []);
      // Reset role if it's not available in the new department
      if (formData.role && selectedDepartment && !selectedDepartment.roles.includes(formData.role)) {
        setFormData(prev => ({ ...prev, role: '' }));
      }
    } else {
      setAvailableRoles([]);
      setFormData(prev => ({ ...prev, role: '' }));
    }
  }, [formData.department, departments]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(buildApiUrl(getEndpoint('DEPARTMENTS')));
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showAlert('Error loading departments. Please refresh the page.', 'warning');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: '' }), 5000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(getEndpoint('AUTH.REGISTER')), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the form data locally since backend doesn't return it
        setTempUserData({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department
        });
        setOtpStep(true);
        showAlert('OTP sent to your email. Please check your inbox.', 'success');
      } else {
        showAlert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Safety check for tempUserData
      if (!tempUserData) {
        showAlert('Session expired. Please restart the registration process.', 'danger');
        setOtpStep(false);
        setLoading(false);
        return;
      }

      console.log('Verifying OTP for:', tempUserData.email);
      console.log('OTP:', otp);
      console.log('User data:', tempUserData);
      
      const response = await fetch(buildApiUrl(getEndpoint('AUTH.VERIFY_REGISTRATION')), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tempUserData,
          otp
        }),
      });

      console.log('Verify OTP response status:', response.status);
      const data = await response.json();
      console.log('Verify OTP response data:', data);

      if (response.ok) {
        console.log('Registration successful:', data);
        localStorage.setItem('token', data.token);
        const loginResult = await login(data.user, data.token);
        console.log('Login result:', loginResult);
        showAlert('Registration successful! Welcome to BRAINX!', 'success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        console.error('Registration failed:', data);
        showAlert(data.message || 'OTP verification failed', 'danger');
      }
    } catch (error) {
      console.error('OTP verification network error:', error);
      showAlert('Network error. Please check your connection and try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Safety check for tempUserData
      if (!tempUserData || !tempUserData.email) {
        showAlert('Session expired. Please restart the registration process.', 'danger');
        setOtpStep(false);
        setLoading(false);
        return;
      }

      console.log('Resending OTP for:', tempUserData.email);
      
      const response = await fetch(buildApiUrl(getEndpoint('AUTH.RESEND_OTP')), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tempUserData.email,
          purpose: 'registration'
        }),
      });

      console.log('Resend OTP response status:', response.status);
      const data = await response.json();
      console.log('Resend OTP response data:', data);

      if (response.ok) {
        showAlert('New OTP sent to your email.', 'success');
      } else {
        console.error('Resend OTP failed:', data);
        showAlert(data.message || 'Failed to resend OTP', 'danger');
      }
    } catch (error) {
      console.error('Resend OTP network error:', error);
      showAlert('Network error. Please check your connection and try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setOtpStep(false);
    setOtp('');
    setTempUserData(null);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="d-flex justify-content-center">
              <Card className="auth-container shadow-lg border-0" style={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%'
              }}>
                <Card.Body className="p-4">
                  {alert.show && (
                    <Alert variant={alert.variant} className="mb-3">
                      {alert.message}
                    </Alert>
                  )}

                  {!otpStep ? (
                    <>
                      <h3 className="text-center mb-4 fw-bold" style={{ color: '#333' }}>
                        🧠 Join BRAINX
                      </h3>
                      <p className="text-center text-muted mb-4">
                        Create your account to start learning
                      </p>

                      <Form onSubmit={handleSendOTP}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            style={{ borderRadius: '10px' }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            style={{ borderRadius: '10px' }}
                          />
                          <Form.Text className="text-muted">
                            We'll send a verification code to this email.
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Department</Form.Label>
                          <Form.Select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select your department</option>
                            {departments.map(dept => (
                              <option key={dept.name} value={dept.name}>{dept.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        {formData.department && (
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Role</Form.Label>
                            <Form.Select
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              required
                              style={{ borderRadius: '10px' }}
                            >
                              <option value="">Select your role</option>
                              {availableRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                              Available roles for {formData.department} department
                            </Form.Text>
                          </Form.Group>
                        )}

                        <Button 
                          type="submit" 
                          variant="success" 
                          className="w-100 fw-bold" 
                          disabled={loading || !formData.name || !formData.email || !formData.department || !formData.role}
                          style={{ borderRadius: '25px', padding: '12px' }}
                        >
                          {loading ? 'Sending OTP...' : 'Send Verification Code 📧'}
                        </Button>
                      </Form>
                    </>
                  ) : (
                    <>
                      <h3 className="text-center mb-4 fw-bold" style={{ color: '#333' }}>
                        📱 Verify Your Email
                      </h3>
                      <p className="text-center text-muted mb-4">
                        We've sent a 6-digit code to<br />
                        <strong>{tempUserData?.email}</strong>
                      </p>

                      <Form onSubmit={handleVerifyOTP}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold text-center d-block">Verification Code</Form.Label>
                          <Form.Control
                            type="text"
                            value={otp}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                              if (value.length <= 6) {
                                setOtp(value);
                              }
                            }}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            required
                            className="text-center"
                            style={{ 
                              borderRadius: '10px', 
                              fontSize: '1.5rem', 
                              letterSpacing: '0.5rem',
                              padding: '15px',
                              borderColor: otp.length === 6 ? '#28a745' : '#ced4da'
                            }}
                          />
                          {otp.length > 0 && otp.length < 6 && (
                            <Form.Text className="text-warning">
                              Enter all 6 digits of the verification code
                            </Form.Text>
                          )}
                          {otp.length === 6 && (
                            <Form.Text className="text-success">
                              ✓ Ready to verify
                            </Form.Text>
                          )}
                        </Form.Group>

                        <Button 
                          type="submit" 
                          variant="success" 
                          className="w-100 fw-bold mb-3" 
                          disabled={loading || otp.length !== 6}
                          style={{ borderRadius: '25px', padding: '12px' }}
                        >
                          {loading ? 'Verifying...' : 'Verify & Create Account ✅'}
                        </Button>

                        <div className="text-center">
                          <Button 
                            variant="outline-secondary" 
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="me-2"
                            style={{ borderRadius: '20px' }}
                          >
                            Resend Code
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            onClick={handleBackToRegister}
                            style={{ borderRadius: '20px' }}
                          >
                            Back
                          </Button>
                        </div>
                      </Form>
                    </>
                  )}

                  <div className="text-center mt-4">
                    <p className="text-muted">
                      Already have an account? {' '}
                      <Link to="/login" className="text-decoration-none fw-semibold">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register; 