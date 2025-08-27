import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Badge, Alert, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config';
import { FaLink } from 'react-icons/fa';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);

  const categories = ['All', 'Project Management', 'Leadership', 'Technical', 'Soft Skills'];

  // Redirect non-logged users to home
  useEffect(() => {
    if (!user) {
      window.location.href = '/';
      return;
    }
    fetchCourses();
  }, [user]); // Add user as dependency to refresh when user changes

  const fetchCourses = async () => {
    try {
      console.log('🔍 Fetching courses...');
      const response = await axios.get(buildApiUrl(getEndpoint('COURSES')));
      console.log('✅ Courses fetched successfully:', response.data.length, 'courses');
      console.log('🔍 Courses data:', response.data.map(c => ({id: c.id, title: c.title, department: c.department, is_active: c.is_active})));
      
      // Filter courses: only active courses + user's department + general
      let filteredCourses = response.data.filter(course => {
        // Only show active courses for regular users
        if (!course.is_active) {
          return false;
        }
        
        // Filter by user's department and include "general" department
        if (user && user.department) {
          const courseDepLower = (course.department || '').toLowerCase();
          const userDepLower = (user.department || '').toLowerCase();
          
          const isUserDepartment = courseDepLower === userDepLower;
          const isGeneral = courseDepLower === 'general';
          
          return isUserDepartment || isGeneral;
        }
        
        return true;
      });
      
      console.log('🔍 Filtered courses for user:', filteredCourses.map(c => ({id: c.id, title: c.title, department: c.department})));
      setCourses(filteredCourses);
      
      // Try to fetch enrollment statuses in bulk instead of individual calls
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const enrollmentsResponse = await axios.get(buildApiUrl(getEndpoint('ENROLLMENTS_MY_ENROLLMENTS')), {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Create a map of course_id to enrollment status
          const statusMap = {};
          enrollmentsResponse.data.forEach(enrollment => {
            statusMap[enrollment.course_id] = {
              isEnrolled: true,
              status: enrollment.status,
              enrollment_id: enrollment.id
            };
          });
          
          setEnrollmentStatuses(statusMap);
          console.log('✅ Enrollment statuses fetched successfully');
        }
      } catch (enrollmentError) {
        console.warn('⚠️ Could not fetch enrollment statuses, continuing without them:', enrollmentError);
        // Don't fail the entire course fetch if enrollment status fails
        setEnrollmentStatuses({});
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
      showAlert('Error loading courses. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const copyCourseLink = async (courseId) => {
    try {
      const courseLink = `${window.location.origin}/courses/${courseId}`;
      await navigator.clipboard.writeText(courseLink);
      showAlert('Course link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying link:', error);
      showAlert('Error copying link', 'danger');
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      showAlert('Please login to enroll in courses', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(buildApiUrl(getEndpoint('ENROLLMENTS')), 
        { course_id: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('Successfully enrolled in course!', 'success');
      
      // Update enrollment status
      setEnrollmentStatuses(prev => ({
        ...prev,
        [courseId]: { isEnrolled: true, status: 'active' }
      }));
    } catch (error) {
      console.error('Error enrolling:', error);
      if (error.response?.status === 400) {
        showAlert('You are already enrolled in this course', 'info');
      } else {
        showAlert('Error enrolling in course', 'danger');
      }
    }
  };

  const handleRequestCompletion = async (courseId) => {
    // Find the course to get quiz link
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      showAlert('Course not found', 'danger');
      return;
    }

    // Set selected course for quiz modal
    setSelectedCourseForQuiz(course);
    setShowQuizModal(true);
  };

  const handleQuizResponse = (takeQuiz) => {
    if (takeQuiz) {
      // Open quiz link in new tab
      window.open(selectedCourseForQuiz.quiz_link, '_blank');
    }
    
    // Close modal and proceed with completion request
    setShowQuizModal(false);
    proceedWithCompletionRequest(selectedCourseForQuiz.id);
    setSelectedCourseForQuiz(null);
  };

  const proceedWithCompletionRequest = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      
      // First, get the user's enrollments to find the enrollment ID for this course
      const enrollmentsResponse = await axios.get(buildApiUrl(getEndpoint('ENROLLMENTS_MY_ENROLLMENTS')), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Find the enrollment for this specific course
      const enrollment = enrollmentsResponse.data.find(e => e.course_id === courseId);
      
      if (!enrollment) {
        showAlert('Enrollment not found for this course', 'danger');
        return;
      }

      await axios.post(buildApiUrl(`/api/enrollments/${enrollment.id}/request-completion`), 
        { notes: 'Course completion requested by user' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('Completion request submitted! Admin will review.', 'success');
      
      // Update enrollment status
      setEnrollmentStatuses(prev => ({
        ...prev,
        [courseId]: { ...prev[courseId], status: 'completion_requested' }
      }));
    } catch (error) {
      console.error('Error requesting completion:', error);
      showAlert('Error requesting completion', 'danger');
    }
  };

  const handleViewDocument = (course) => {
    setSelectedDocument(course);
    setShowDocumentModal(true);
  };

  const getDefaultImageUrl = (course) => {
    // Use professional project management related images
    const defaultImages = [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'
    ];
    
    // If course has an uploaded image, use it
    if (course.image_url && course.image_url.startsWith('/uploads/')) {
      return course.image_url;
    }
    
    // If course has an external image URL, use it
    if (course.image_url && course.image_url.startsWith('http')) {
      return course.image_url;
    }
    
    // Use a different image for each course based on index
    const index = courses.indexOf(course);
    return defaultImages[index % defaultImages.length];
  };

  const getEnrollmentButton = (course) => {
    const enrollmentStatus = enrollmentStatuses[course.id];
    
    if (!user) {
      return (
        <Button variant="secondary" className="w-100" disabled>
          🔒 Login to Enroll
        </Button>
      );
    }

    if (!enrollmentStatus?.isEnrolled) {
      return (
        <Button
          variant="primary"
          className="w-100"
          onClick={() => handleEnroll(course.id)}
        >
          📋 Enroll Now
        </Button>
      );
    }

    switch (enrollmentStatus.status) {
      case 'active':
        return (
          <Button
            variant="success"
            className="w-100"
            onClick={() => handleRequestCompletion(course.id)}
          >
            ✅ Request Completion
          </Button>
        );
      case 'completion_requested':
        return (
          <Button variant="warning" className="w-100" disabled>
            ⏳ Pending Approval
          </Button>
        );
      case 'completed':
        return (
          <Button variant="success" className="w-100" disabled>
            🎓 Completed
          </Button>
        );
      default:
        return (
          <Button variant="secondary" className="w-100" disabled>
            📋 Enrolled
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading courses...</p>
        </div>
      </Container>
    );
  }

  const filteredCourses = filterCourses();

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
        {alert.show && (
          <Alert variant={alert.type} onClose={() => setAlert({ show: false, message: '', type: '' })} dismissible>
            {alert.message}
          </Alert>
        )}

        <Row className="mb-4">
          <Col>
            <h2 className="text-white mb-0">Available Courses</h2>
            <p className="text-white-50">Explore and enroll in courses to enhance your skills</p>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <Row>
            {filteredCourses.map(course => (
              <Col key={course.id} lg={4} md={6} className="mb-4">
                <Card className="h-100 shadow-lg border-0" style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px'
                }}>
                  <Card.Img 
                    variant="top" 
                    src={getDefaultImageUrl(course)}
                    style={{ height: '150px', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';
                    }}
                  />
                  <Card.Body className="d-flex flex-column p-3">
                    <div className="mb-2">
                      <Badge bg="success" className="me-2" style={{ borderRadius: '20px' }}>{course.category}</Badge>
                      <Badge bg="info" style={{ borderRadius: '20px' }}>Free</Badge>
                    </div>
                    <Card.Title className="h6 mb-2 fw-bold">{course.title}</Card.Title>
                    <Card.Text className="text-muted small mb-3">
                      {course.description?.substring(0, 80)}...
                    </Card.Text>
                    
                    <div className="course-resources mb-3">
                      {course.document_url && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-2 mb-2"
                          onClick={() => handleViewDocument(course)}
                          style={{ borderRadius: '25px' }}
                        >
                          📄 View Document
                        </Button>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex gap-2">
                        {getEnrollmentButton(course)}
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => copyCourseLink(course.id)}
                          title="Copy course link"
                          style={{ borderRadius: '25px' }}
                        >
                          🔗 Copy Link
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="text-center py-5 shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <div className="mb-4">
                <i className="fas fa-search fa-3x text-muted"></i>
              </div>
              <h4 className="text-muted">No courses found</h4>
              <p className="text-muted">
                {searchTerm || selectedCategory !== 'All'
                  ? 'Try adjusting your search criteria'
                  : 'No courses available yet'}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Document Modal */}
        <Modal show={showDocumentModal} onHide={() => setShowDocumentModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Course Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedDocument && (
              <div>
                <h5>{selectedDocument.title}</h5>
                <p className="text-muted">{selectedDocument.description}</p>
                <div className="text-center">
                  <Button
                    variant="primary"
                    href={selectedDocument.document_url}
                    target="_blank"
                    className="me-2"
                  >
                    📄 Download Document
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => window.open(selectedDocument.document_url, '_blank')}
                  >
                    👁️ View Online
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Quiz Modal */}
        <Modal show={showQuizModal} onHide={() => setShowQuizModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>📝 Course Quiz Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCourseForQuiz && (
              <div className="text-center">
                <h5 className="mb-3">{selectedCourseForQuiz.title}</h5>
                <p className="mb-4">
                  Before completing this course, you need to attempt the quiz. 
                  Would you like to take the quiz now?
                </p>
                <div className="alert alert-info">
                  <small>
                    <strong>Note:</strong> The quiz will open in a new tab. You can proceed with 
                    completion request whether you take the quiz now or later.
                  </small>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => handleQuizResponse(false)}>
              ❌ Skip Quiz for Now
            </Button>
            <Button variant="primary" onClick={() => handleQuizResponse(true)}>
              📝 Take Quiz
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Courses; 