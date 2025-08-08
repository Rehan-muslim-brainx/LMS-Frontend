import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from 'react-bootstrap';
import { FaPlay, FaUsers, FaClock, FaBook, FaCheck, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const courseResponse = await axios.get(`/api/courses/${id}`);
        setCourse(courseResponse.data);

        // Fetch lessons
        const lessonsResponse = await axios.get(`/api/lessons/course/${id}`);
        setLessons(lessonsResponse.data);

        // Check enrollment status if user is logged in
        if (user) {
          try {
            const enrollmentResponse = await axios.get(`/api/enrollments/check/${id}`);
            setEnrolled(enrollmentResponse.data.isEnrolled);
          } catch (error) {
            console.error('Error checking enrollment:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, user]);

  const handleEnroll = async () => {
    try {
      await axios.post('/api/enrollments', { course_id: id });
      setEnrolled(true);
      setEnrollmentStatus('success');
    } catch (error) {
      console.error('Error enrolling:', error);
      setEnrollmentStatus('error');
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
            <p className="text-light mt-3">Loading course details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
          <Alert variant="danger">
            <h4>Course not found</h4>
            <p>The course you're looking for doesn't exist.</p>
            <Link to="/courses" className="btn btn-primary">
              Back to Courses
            </Link>
          </Alert>
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
      <Row>
        {/* Course Header */}
        <Col lg={8}>
          <div className="mb-4">
            <img 
              src={course.image_url || 'https://via.placeholder.com/800x400?text=Course+Image'} 
              alt={course.title}
              className="img-fluid rounded mb-3"
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
            <h1>{course.title}</h1>
            <p className="text-muted lead">{course.description}</p>
            
            <div className="d-flex gap-3 mb-4">
              <Badge bg="success" style={{ borderRadius: '20px' }}>{course.category}</Badge>
              {course.price > 0 ? (
                <Badge bg="warning">${course.price}</Badge>
              ) : (
                <Badge bg="info">Free</Badge>
              )}
            </div>

            <div className="d-flex gap-4 text-muted mb-4">
              <div>
                <FaUsers className="me-2" />
                {course.instructor?.name || 'Unknown Instructor'}
              </div>
              <div>
                <FaClock className="me-2" />
                {course.duration || 0} hours
              </div>
              <div>
                <FaBook className="me-2" />
                {lessons.length} lessons
              </div>
            </div>

            {enrollmentStatus === 'success' && (
              <Alert variant="success">
                Successfully enrolled in this course!
              </Alert>
            )}

            {enrollmentStatus === 'error' && (
              <Alert variant="danger">
                Failed to enroll. Please try again.
              </Alert>
            )}

            {!enrolled && user ? (
              <Button 
                variant="success" 
                size="lg" 
                onClick={handleEnroll}
                className="mb-4"
                style={{ borderRadius: '25px' }}
              >
                <FaCheck className="me-2" />
                Enroll Now
              </Button>
            ) : !user ? (
              <Alert variant="info">
                <Link to="/login" className="alert-link">Sign in</Link> to enroll in this course.
              </Alert>
            ) : (
              <Alert variant="success">
                You are enrolled in this course!
              </Alert>
            )}
          </div>
        </Col>

        {/* Course Sidebar */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Course Content</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {lessons.map((lesson, index) => (
                  <ListGroup.Item key={lesson.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center">
                        {enrolled ? (
                          <FaPlay className="text-primary me-2" />
                        ) : (
                          <FaLock className="text-muted me-2" />
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      <small className="text-muted">
                        {lesson.duration || 0} minutes
                      </small>
                    </div>
                    {enrolled && (
                      <Button 
                        as={Link} 
                        to={`/courses/${id}/lessons/${lesson.id}`}
                        variant="outline-primary" 
                        size="sm"
                      >
                        Start
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default CourseDetail; 