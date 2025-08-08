import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [otpStep, setOtpStep] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

    const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: '' }), 5000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpStep(true);
        showAlert('OTP sent to your email. Please check your inbox.', 'success');
      } else {
        showAlert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);
        const loginResult = await login(data.user, data.token);
        console.log('Login result:', loginResult);
        showAlert('Login successful! Welcome back!', 'success');
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
          email,
          purpose: 'login'
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

  const handleBackToLogin = () => {
    setOtpStep(false);
    setOtp('');
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
          <Col md={6} lg={4}>
            <div className="d-flex justify-content-center">
              <Card className="auth-container shadow-lg border-0" style={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                maxWidth: '400px',
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
                        🧠 Welcome Back
                      </h3>
                      <p className="text-center text-muted mb-4">
                        Sign in to your BRAINX account
                      </p>

                      <Form onSubmit={handleSendOTP}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{ borderRadius: '10px', padding: '12px' }}
                          />
                          <Form.Text className="text-muted">
                            We'll send a verification code to this email.
                          </Form.Text>
                        </Form.Group>

                        <Button 
                          type="submit" 
                          variant="success" 
                          className="w-100 fw-bold" 
                          disabled={loading}
                          style={{ borderRadius: '25px', padding: '12px' }}
                        >
                          {loading ? 'Sending Code...' : 'Send Login Code 📧'}
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
                        <strong>{email}</strong>
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
                          {loading ? 'Signing In...' : 'Sign In ✅'}
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
                            onClick={handleBackToLogin}
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
                      Don't have an account? {' '}
                      <Link to="/register" className="text-decoration-none fw-semibold">
                        Sign Up
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

export default Login; 