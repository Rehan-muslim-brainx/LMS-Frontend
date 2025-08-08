import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaSave, FaEdit } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/api/users/${user.id}`, formData);
      updateUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await axios.put(`/api/users/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

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
        <Row className="mb-4">
          <Col>
            <h2 className="text-white mb-0">My Profile</h2>
            <p className="text-white-50">Manage your account settings and preferences</p>
          </Col>
        </Row>

          {/* Profile Information */}
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaUser className="me-2" />
                  Profile Information
                </h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  <FaEdit className="me-1" />
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="text-muted"
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Avatar URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </Form.Group>

                {editing && (
                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="success" 
                      disabled={loading}
                      style={{ borderRadius: '25px' }}
                    >
                      <FaSave className="me-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary" 
                      onClick={() => setEditing(false)}
                      style={{ borderRadius: '25px' }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaLock className="me-2" />
                Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  type="submit" 
                  variant="success" 
                  disabled={passwordLoading}
                  style={{ borderRadius: '25px' }}
                >
                  <FaLock className="me-2" />
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Account Information */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaEnvelope className="me-2" />
                Account Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Last updated:</strong> {new Date(user.updated_at || user.created_at).toLocaleDateString()}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </div>
  );
};

export default Profile; 