import React, { useState, useEffect } from 'react';
import { buildApiUrl, getEndpoint } from '../config';

import { Container, Row, Col, Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlay, FaBook, FaUsers, FaClock, FaGraduationCap, FaCheck, FaHourglassHalf } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    pendingApproval: 0
  });

  // Helper function to fix image URLs
  const getImageUrl = (imageUrl) => {
    console.log('🔍 getImageUrl called with:', imageUrl);
    console.log('🔍 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    
    if (!imageUrl) {
      console.log('🔍 No image URL, using default');
      return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      console.log('🔍 Full URL detected, returning as is');
      return imageUrl;
    }
    
    // If it's a relative path, construct full URL
    if (imageUrl.startsWith('/uploads/')) {
      const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
      console.log('🔍 Constructed full URL:', fullUrl);
      return fullUrl;
    }
    
    // Default fallback
    console.log('🔍 Using default fallback image');
    return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';
  };

  useEffect(() => {
    // Redirect non-logged users to home
    if (!user) {
      window.location.href = '/';
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch user enrollments
        const enrollmentsResponse = await axios.get(buildApiUrl(getEndpoint('ENROLLMENTS_MY_ENROLLMENTS')), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('✅ Dashboard - Enrollments fetched:', enrollmentsResponse.data);
        console.log('✅ Dashboard - User:', user);
        
        // Filter enrollments: hide deactivated courses unless completed
        const filteredEnrollments = enrollmentsResponse.data.filter(enrollment => {
          const course = enrollment.course;
          
          // Always show if course is active
          if (course && course.is_active) {
            return true;
          }
          
          // For deactivated courses, only show if completed
          if (course && !course.is_active) {
            return enrollment.status === 'completed';
          }
          
          // Default: show enrollment if course data is missing
          return true;
        });
        
        console.log('🔍 Dashboard - Filtered enrollments:', filteredEnrollments.length, 'of', enrollmentsResponse.data.length);
        setEnrollments(filteredEnrollments);

        // Fetch all courses for project managers and admins
        const allowedRoles = ['associate_project_manager', 'assistant_project_manager', 'principal_software_engineer', 'admin'];
        if (allowedRoles.includes(user.role)) {
          const token = localStorage.getItem('token');
          const coursesResponse = await axios.get(buildApiUrl(getEndpoint('USER_COURSES')), {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCourses(coursesResponse.data);
        }

        // Debug: Log enrollment data
        console.log('🔍 Dashboard - All enrollments:', enrollmentsResponse.data);
        console.log('🔍 Dashboard - User ID:', user.id);
        console.log('🔍 Dashboard - Enrollment statuses:', enrollmentsResponse.data.map(e => ({id: e.id, status: e.status, course_id: e.course_id})));
        
        // Calculate stats
        const totalCourses = enrollmentsResponse.data.length;
        const completedCourses = enrollmentsResponse.data.filter(e => e.status === 'completed').length;
        const inProgressCourses = enrollmentsResponse.data.filter(e => e.status === 'active').length;
        const pendingApproval = enrollmentsResponse.data.filter(e => e.status === 'completion_requested').length;

        console.log('🔍 Dashboard - Stats calculated:', {totalCourses, completedCourses, inProgressCourses, pendingApproval});

        setStats({
          totalCourses,
          completedCourses,
          inProgressCourses,
          pendingApproval
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">🎓 Completed</Badge>;
      case 'completion_requested':
        return <Badge bg="warning">⏳ Pending Approval</Badge>;
      case 'active':
        return <Badge bg="primary">📚 In Progress</Badge>;
      default:
        return <Badge bg="secondary">📋 Enrolled</Badge>;
    }
  };

  const getProgressValue = (enrollment) => {
    switch (enrollment.status) {
      case 'completed':
        return 100;
      case 'completion_requested':
        return 90;
      case 'active':
        return enrollment.progress || 30;
      default:
        return 0;
    }
  };

  const getProgressColor = (enrollment) => {
    switch (enrollment.status) {
      case 'completed':
        return 'success';
      case 'completion_requested':
        return 'warning';
      case 'active':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-light mt-3">Loading your dashboard...</p>
          </div>
        </Container>
      </div>
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
            <h2 className="text-white mb-0">Welcome back, {user.name}!</h2>
            <p className="text-white-50">Track your learning progress and manage your courses</p>
          </Col>
        </Row>

        {/* User Completion Badge */}
        {stats.completedCourses > 0 && (
          <div className="text-center mb-4">
            <Badge bg="success" className="fs-6 px-3 py-2">
              🎓 {stats.completedCourses} Course{stats.completedCourses !== 1 ? 's' : ''} Completed
            </Badge>
          </div>
        )}

        {/* Stats Cards */}
        <Row className="mb-5">
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-lg border-0" style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Card.Body>
                <FaBook size={40} className="text-success mb-3" />
                <h3 className="text-success">{stats.totalCourses}</h3>
                <p className="mb-0">Total Courses</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-lg border-0" style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Card.Body>
                <FaPlay size={40} className="text-info mb-3" />
                <h3 className="text-info">{stats.inProgressCourses}</h3>
                <p className="mb-0">In Progress</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-lg border-0" style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Card.Body>
                <FaHourglassHalf size={40} className="text-warning mb-3" />
                <h3 className="text-warning">{stats.pendingApproval}</h3>
                <p className="mb-0">Pending Approval</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100 shadow-lg border-0" style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Card.Body>
                <FaGraduationCap size={40} className="text-success mb-3" />
                <h3 className="text-success">{stats.completedCourses}</h3>
                <p className="mb-0">Completed</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* My Courses Section */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-lg border-0" style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Card.Body>
                <h3 className="mb-4">My Courses</h3>
                {enrollments.length === 0 ? (
                  <Card className="text-center py-5" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                    <Card.Body>
                      <FaBook size={60} className="text-muted mb-3" />
                      <h4>No courses enrolled yet</h4>
                      <p className="text-muted mb-4">
                        Start your learning journey by enrolling in courses
                      </p>
                      <Button as={Link} to="/courses" variant="primary" style={{ borderRadius: '25px' }}>
                        Browse Courses
                      </Button>
                    </Card.Body>
                  </Card>
                ) : (
            <Row>
              {enrollments.map((enrollment) => {
                console.log('🔍 Rendering enrollment:', enrollment.id, 'Course image:', enrollment.course?.image_url);
                return (
                <Col key={enrollment.id} lg={4} md={6} className="mb-4">
                  <Card className="course-card h-100">
                    <Card.Img 
                      variant="top" 
                      src={getImageUrl(enrollment.course?.image_url)} 
                      className="course-image"
                      onError={(e) => {
                        console.log('❌ Image failed to load for enrollment:', enrollment.id);
                        e.target.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';
                      }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        {getStatusBadge(enrollment.status)}
                        <Badge bg="secondary" className="ms-2">{enrollment.course?.category}</Badge>
                      </div>
                      <Card.Title>{enrollment.course?.title}</Card.Title>
                      <Card.Text className="text-muted">
                        {enrollment.course?.description?.substring(0, 100)}...
                      </Card.Text>
                      <div className="mt-auto">
                        <div className="mb-3">
                          <small className="text-muted">Progress</small>
                          <ProgressBar 
                            now={getProgressValue(enrollment)} 
                            variant={getProgressColor(enrollment)}
                            className="mt-1"
                          />
                        </div>
                        <div className="d-grid gap-2">
                          {enrollment.status === 'active' && (
                            <Button 
                              as={Link} 
                              to={`/courses/${enrollment.course_id}`} 
                              variant="primary" 
                              size="sm"
                            >
                              <FaPlay className="me-2" />
                              Continue Learning
                            </Button>
                          )}
                          {enrollment.status === 'completion_requested' && (
                            <Button variant="warning" size="sm" disabled>
                              <FaHourglassHalf className="me-2" />
                              Awaiting Approval
                            </Button>
                          )}
                          {enrollment.status === 'completed' && (
                            <Button variant="success" size="sm" disabled>
                              <FaCheck className="me-2" />
                              Course Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
              })}
            </Row>
          )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Project Manager Section */}
      {['associate_project_manager', 'assistant_project_manager', 'principal_software_engineer', 'admin'].includes(user.role) && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-lg border-0" style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Card.Body>
                <h3 className="mb-4">All Available Courses</h3>
                <Row>
                  {courses.map(course => {
                    console.log('🔍 Rendering course:', course.id, 'Course image:', course.image_url);
                    return (
                      <Col key={course.id} lg={4} md={6} className="mb-4">
                        <Card className="h-100 shadow border-0" style={{ 
                          backgroundColor: 'rgba(255,255,255,0.9)', 
                          borderRadius: '12px'
                        }}>
                          <Card.Img 
                            variant="top" 
                            src={getImageUrl(course.image_url)} 
                            style={{ height: '150px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
                            onError={(e) => {
                              console.log('❌ Image failed to load for course:', course.id);
                              e.target.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';
                            }}
                          />
                          <Card.Body className="d-flex flex-column p-3">
                            <div className="mb-2">
                              <Badge bg="success" className="me-2" style={{ borderRadius: '20px' }}>{course.category}</Badge>
                              {course.document_url && <Badge bg="info" style={{ borderRadius: '20px' }}>📄</Badge>}
                              {course.external_link && <Badge bg="success" style={{ borderRadius: '20px' }}>🔗</Badge>}
                            </div>
                            <Card.Title className="h6 mb-2 fw-bold">{course.title}</Card.Title>
                            <Card.Text className="text-muted small mb-3">
                              {course.description?.substring(0, 80)}...
                            </Card.Text>
                            <div className="mt-auto">
                              <Button 
                                as={Link} 
                                to={`/courses/${course.id}`} 
                                variant="success" 
                                size="sm"
                                className="w-100"
                                style={{ borderRadius: '25px' }}
                              >
                                <FaPlay className="me-2" />
                                View Course
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <Row className="mt-5">
        <Col className="text-center">
          <h3 className="mb-4 text-white">Quick Actions</h3>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button as={Link} to="/courses" variant="light" size="lg" className="shadow">
              <FaBook className="me-2" />
              Browse All Courses
            </Button>
            {user.role === 'admin' && (
              <Button as={Link} to="/admin" variant="light" size="lg" className="shadow">
                <FaUsers className="me-2" />
                Admin Panel
              </Button>
            )}
            <Button as={Link} to="/profile" variant="light" size="lg" className="shadow">
              <FaUsers className="me-2" />
              My Profile
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default Dashboard; 