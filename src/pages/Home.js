import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlay, FaUsers, FaClock, FaStar, FaLink } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        // Get first 3 courses as featured
        setFeaturedCourses(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Slider timer effect
  useEffect(() => {
    if (featuredCourses.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const maxSlides = Math.ceil(featuredCourses.length / 2);
        return (prevSlide + 1) % maxSlides;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredCourses.length, isPaused]);

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

  const getCurrentSlideCourses = () => {
    const startIndex = currentSlide * 2;
    return featuredCourses.slice(startIndex, startIndex + 2);
  };

  const getTotalSlides = () => {
    return Math.ceil(featuredCourses.length / 2);
  };

  const getDefaultImageUrl = (course) => {
    // Use a professional project management related image
    const defaultImages = [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'
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
    const index = featuredCourses.indexOf(course);
    return defaultImages[index % defaultImages.length];
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading featured courses...</p>
        </div>
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
        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
            {alert.message}
          </Alert>
        )}

        {/* Hero Section */}
        <Row className="mb-5">
          <Col className="text-center">
            <h1 className="display-4 mb-4 text-white">Welcome to BRAINX Learning</h1>
            <p className="lead mb-4 text-white-50">
              Enhance your project management skills with our comprehensive training platform
            </p>
            <Button as={Link} to="/courses" variant="light" size="lg" className="shadow">
              <FaPlay className="me-2" />
              Start Learning
            </Button>
          </Col>
        </Row>

        {/* Featured Courses Slider */}
        {featuredCourses.length > 0 && (
          <Row className="mb-5">
            <Col>
              <div className="text-center mb-5">
                <h2 className="text-white mb-3">Featured Courses</h2>
                <p className="text-white-50 mb-0">
                  Discover our most popular project management courses
                </p>
              </div>
              
              {/* Slider Container */}
              <div 
                className="position-relative"
                onMouseEnter={() => {
                  console.log('Mouse entered - pausing slider');
                  setIsPaused(true);
                }}
                onMouseLeave={() => {
                  console.log('Mouse left - resuming slider');
                  setIsPaused(false);
                }}
                style={{ padding: '0 50px' }}
              >
                {/* Manual Navigation Buttons */}
                {getTotalSlides() > 1 && (
                  <>
                    <Button
                      variant="light"
                      size="sm"
                      className="position-absolute shadow"
                      style={{ 
                        top: '50%', 
                        left: '-40px', 
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        setIsPaused(true);
                        setCurrentSlide((prev) => 
                          prev === 0 ? getTotalSlides() - 1 : prev - 1
                        );
                        setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
                      }}
                    >
                      ‹
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className="position-absolute shadow"
                      style={{ 
                        top: '50%', 
                        right: '-40px', 
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        setIsPaused(true);
                        setCurrentSlide((prev) => 
                          (prev + 1) % getTotalSlides()
                        );
                        setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
                      }}
                    >
                      ›
                    </Button>
                  </>
                )}
                
                <Row style={{ 
                  transition: 'opacity 0.5s ease-in-out',
                  minHeight: '350px',
                  opacity: isPaused ? 0.8 : 1
                }} className="justify-content-center">
                  {getCurrentSlideCourses().map((course) => (
                    <Col key={course.id} lg={6} md={6} className="mb-4">
                      <Card className="h-100 shadow-lg border-0" style={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '1px solid rgba(255,255,255,0.2)'
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
                            <Badge bg="primary" className="me-2" style={{ borderRadius: '20px' }}>{course.category}</Badge>
                            {course.price > 0 ? (
                              <Badge bg="success" style={{ borderRadius: '20px' }}>${course.price}</Badge>
                            ) : (
                              <Badge bg="info" style={{ borderRadius: '20px' }}>Free</Badge>
                            )}
                          </div>
                          <Card.Title className="h6 mb-2 fw-bold">{course.title}</Card.Title>
                          <Card.Text className="text-muted small mb-3">
                            {course.description?.substring(0, 80)}...
                          </Card.Text>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">
                                <FaUsers className="me-1" />
                                {course.instructor?.name || 'Unknown Instructor'}
                              </small>
                              <small className="text-muted">
                                <FaClock className="me-1" />
                                {course.duration || 0} hours
                              </small>
                            </div>
                            <div className="d-flex gap-2">
                              <Button 
                                as={Link} 
                                to={`/courses/${course.id}`} 
                                variant="success" 
                                size="sm"
                                className="flex-grow-1"
                                style={{ borderRadius: '25px' }}
                              >
                                <FaPlay className="me-1" />
                                View Course
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => copyCourseLink(course.id)}
                                title="Copy course link"
                                style={{ borderRadius: '25px' }}
                              >
                                🔗
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                {/* Slider Navigation Dots */}
                {getTotalSlides() > 1 && (
                  <div className="text-center mt-4">
                    <div className="d-flex justify-content-center gap-3">
                      {Array.from({ length: getTotalSlides() }, (_, index) => (
                        <button
                          key={index}
                          className={`btn btn-sm ${index === currentSlide ? 'btn-light' : 'btn-outline-light'}`}
                          onClick={() => {
                            setIsPaused(true);
                            setCurrentSlide(index);
                            setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
                          }}
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            padding: 0,
                            border: '2px solid',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}

        <Row className="mt-5">
          <Col className="text-center">
            <Button as={Link} to="/courses" variant="light" size="lg" className="shadow">
              View All Courses
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home; 