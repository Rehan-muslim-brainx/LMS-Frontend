import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [otpStep, setOtpStep] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setTempUserData(data.tempUserData);
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
      const response = await fetch('http://localhost:5000/api/auth/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tempUserData,
          otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        localStorage.setItem('token', data.token);
        const loginResult = await login(data.user, data.token);
        console.log('Login result:', loginResult);
        showAlert('Registration successful! Welcome to BRAINX!', 'success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showAlert(data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showAlert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tempUserData.email,
          purpose: 'registration'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('New OTP sent to your email.', 'success');
      } else {
        showAlert(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      showAlert('Network error. Please try again.');
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
                          <Form.Label className="fw-semibold">Role</Form.Label>
                          <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select your role</option>
                            <option value="project_coordinator">Project Coordinator</option>
                            <option value="associate_project_manager">Associate Project Manager</option>
                            <option value="assistant_project_manager">Assistant Project Manager</option>
                            <option value="principal_software_engineer">Principal Software Engineer</option>
                          </Form.Select>
                        </Form.Group>

                        <Button 
                          type="submit" 
                          variant="success" 
                          className="w-100 fw-bold" 
                          disabled={loading}
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
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            required
                            className="text-center"
                            style={{ 
                              borderRadius: '10px', 
                              fontSize: '1.5rem', 
                              letterSpacing: '0.5rem',
                              padding: '15px'
                            }}
                          />
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