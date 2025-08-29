import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaCog, FaHome, FaBook, FaChartBar, FaCrown } from 'react-icons/fa';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar 
      expand="lg" 
      className="custom-navbar"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backdropFilter: 'blur(10px)',
        border: 'none',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        marginBottom: '0',
        padding: '1rem 0'
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand d-flex align-items-center" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
          <span style={{ 
            color: 'white',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}>
            BRAINX
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          style={{ 
            border: 'none',
            color: 'white',
            filter: 'brightness(1.2)'
          }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user?.role !== 'admin' && user?.role !== 'general' && (
              <Nav.Link 
                as={Link} 
                to="/" 
                onClick={handleNavClick}
                className="nav-link-custom"
                style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  marginRight: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255,255,255,0.9)';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <FaHome className="me-1" />
                Home
              </Nav.Link>
            )}
            {user && user?.role !== 'admin' && user?.role !== 'general' && (
              <Nav.Link 
                as={Link} 
                to="/courses" 
                onClick={handleNavClick}
                className="nav-link-custom"
                style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  marginRight: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255,255,255,0.9)';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <FaBook className="me-1" />
                Courses
              </Nav.Link>
            )}
            {user && user?.role !== 'admin' && user?.role !== 'general' && (
              <Nav.Link 
                as={Link} 
                to="/dashboard" 
                onClick={handleNavClick}
                className="nav-link-custom"
                style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  marginRight: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255,255,255,0.9)';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <FaChartBar className="me-1" />
                Dashboard
              </Nav.Link>
            )}
            {(user?.role === 'admin' || user?.role === 'general') && (
              <Nav.Link 
                as={Link} 
                to="/admin" 
                onClick={handleNavClick}
                className="nav-link-custom"
                style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  marginRight: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255,255,255,0.9)';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <FaCrown className="me-1" />
                Admin
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <NavDropdown 
                title={
                  <span style={{ 
                    color: 'rgba(255,255,255,0.9)',
                    marginRight: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'white';
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.9)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <FaUser className="me-1" />
                  {user.name}
                </span>
                } 
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item 
                  as={Link} 
                  to="/profile" 
                  onClick={handleNavClick}
                  style={{ 
                    borderRadius: '8px',
                    margin: '0.25rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <FaCog className="me-2" />
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item 
                  onClick={handleLogout}
                  style={{ 
                    borderRadius: '8px',
                    margin: '0.25rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  onClick={handleNavClick}
                  className="nav-link-custom"
                  style={{ 
                    color: 'rgba(255,255,255,0.9)',
                    marginRight: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'white';
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.9)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register" 
                  onClick={handleNavClick}
                  className="nav-link-custom"
                  style={{ 
                    color: 'rgba(255,255,255,0.9)',
                    marginRight: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'white';
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.9)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 