import React, { useState } from 'react';
import { buildApiUrl, getEndpoint } from '../config';

import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaUser, FaShieldAlt } from 'react-icons/fa';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'danger' });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showAlert = (message, type = 'danger') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(false), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(getEndpoint('AUTH.ADMIN_LOGIN')), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        const loginResult = await login(data.user, data.token);
        if (loginResult.success) {
          showAlert('Admin login successful! Welcome back!', 'success');
          setTimeout(() => navigate('/admin'), 1500);
        } else {
          showAlert(loginResult.message || 'Login failed');
        }
      } else {
        showAlert(data.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      showAlert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0'
    }}>
      <Container>
        <div className="text-center mb-4">
          <h1 className="text-white mb-3">
            <FaShieldAlt className="me-3" />
            Admin Access
          </h1>
          <p className="text-white-50">Enter your admin credentials to access the admin panel</p>
        </div>

        <Card className="shadow-lg border-0" style={{ 
          backgroundColor: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <Card.Body className="p-5">
            {alert.show && (
              <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })}>
                {alert.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="me-2" />
                  Admin Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  required
                  className="border-0 shadow-sm"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <FaLock className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className="border-0 shadow-sm"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-100 mb-3"
                disabled={loading}
                style={{ 
                  borderRadius: '10px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 'none'
                }}
              >
                {loading ? 'Signing In...' : (
                  <>
                    <FaShieldAlt className="me-2" />
                    Admin Login
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate('/login')}
                  className="text-muted text-decoration-none"
                >
                  ← Back to User Login
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <p className="text-white-50 small">
            <FaShieldAlt className="me-1" />
            This is a secure admin-only access point
          </p>
        </div>
      </Container>
    </div>
  );
};

export default AdminLogin; 