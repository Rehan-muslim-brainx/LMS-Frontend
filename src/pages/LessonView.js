import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { FaPlay, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import ReactPlayer from 'react-player';
import axios from 'axios';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        // Fetch lesson details
        const lessonResponse = await axios.get(`/api/lessons/${lessonId}`);
        setLesson(lessonResponse.data);

        // Fetch course details
        const courseResponse = await axios.get(`/api/courses/${courseId}`);
        setCourse(courseResponse.data);

        // Fetch all lessons for navigation
        const lessonsResponse = await axios.get(`/api/lessons/course/${courseId}`);
        setLessons(lessonsResponse.data);

        // Find current lesson index
        const index = lessonsResponse.data.findIndex(l => l.id === lessonId);
        setCurrentLessonIndex(index);
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, courseId]);

  const getPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      return lessons[currentLessonIndex - 1];
    }
    return null;
  };

  const getNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      return lessons[currentLessonIndex + 1];
    }
    return null;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h4>Lesson not found</h4>
          <Link to={`/courses/${courseId}`} className="btn btn-primary">
            Back to Course
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        {/* Main Content */}
        <Col lg={8}>
          <div className="mb-4">
            <Link to={`/courses/${courseId}`} className="btn btn-outline-secondary mb-3">
              <FaArrowLeft className="me-2" />
              Back to Course
            </Link>

            <h1>{lesson.title}</h1>
            
            {lesson.video_url && (
              <div className="mb-4">
                <ReactPlayer
                  url={lesson.video_url}
                  controls
                  width="100%"
                  height="400px"
                  style={{ backgroundColor: '#000' }}
                />
              </div>
            )}

            <div className="lesson-content">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>

            {/* Navigation */}
            <div className="d-flex justify-content-between mt-5">
              {getPreviousLesson() ? (
                <Button 
                  as={Link} 
                  to={`/courses/${courseId}/lessons/${getPreviousLesson().id}`}
                  variant="outline-primary"
                >
                  <FaArrowLeft className="me-2" />
                  Previous Lesson
                </Button>
              ) : (
                <div></div>
              )}

              {getNextLesson() ? (
                <Button 
                  as={Link} 
                  to={`/courses/${courseId}/lessons/${getNextLesson().id}`}
                  variant="primary"
                >
                  Next Lesson
                  <FaArrowRight className="ms-2" />
                </Button>
              ) : (
                <Button 
                  as={Link} 
                  to={`/courses/${courseId}`}
                  variant="success"
                >
                  <FaCheck className="me-2" />
                  Complete Course
                </Button>
              )}
            </div>
          </div>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Course Progress</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Progress</small>
                  <small>{Math.round(((currentLessonIndex + 1) / lessons.length) * 100)}%</small>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${((currentLessonIndex + 1) / lessons.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <h6>Course Content</h6>
              <ListGroup variant="flush">
                {lessons.map((l, index) => (
                  <ListGroup.Item 
                    key={l.id} 
                    className={`d-flex justify-content-between align-items-center ${
                      l.id === lessonId ? 'active' : ''
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      {index < currentLessonIndex ? (
                        <FaCheck className="text-success me-2" />
                      ) : index === currentLessonIndex ? (
                        <FaPlay className="text-primary me-2" />
                      ) : (
                        <div className="me-2" style={{ width: '16px' }}></div>
                      )}
                      <span className={index > currentLessonIndex ? 'text-muted' : ''}>
                        {l.title}
                      </span>
                    </div>
                    {l.duration && (
                      <small className="text-muted">
                        {l.duration} min
                      </small>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LessonView; 