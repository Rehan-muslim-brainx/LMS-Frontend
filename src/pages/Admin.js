import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import { FaLink } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Admin = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [completedEnrollments, setCompletedEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Project Management',
    price: 0, // Always free
    duration: 0,
    image_url: '',
    document_url: '',
    external_link: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [approvalNotes, setApprovalNotes] = useState('');

  // Default course image
  const defaultCourseImage = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';

  useEffect(() => {
    fetchData();
  }, []);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container>
          <Card className="text-center shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body className="p-5">
              <h2 className="text-danger mb-4">🚫 Access Denied</h2>
              <p className="text-muted">You don't have permission to access the admin panel.</p>
              <p className="text-muted">Only administrators can view this page.</p>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch courses
      const coursesResponse = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(coursesResponse.data);

      // Fetch users
      const usersResponse = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data);

      // Fetch pending approvals
      const pendingResponse = await axios.get('http://localhost:5000/api/enrollments/pending-approval', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingApprovals(pendingResponse.data);

      // Fetch completed enrollments
      const completedResponse = await axios.get('http://localhost:5000/api/enrollments/completed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedEnrollments(completedResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImageFileSelect = (event) => {
    setSelectedImageFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.filename;
    } catch (error) {
      console.error('Error uploading file:', error);
      showAlert('Error uploading file', 'danger');
      return null;
    }
  };

  const uploadImageFile = async () => {
    if (!selectedImageFile) return null;

    const formData = new FormData();
    formData.append('file', selectedImageFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return `/uploads/${response.data.filename}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      showAlert('Error uploading image', 'danger');
      return null;
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one resource is provided
    if (!selectedFile && !courseForm.document_url && !courseForm.external_link) {
      showAlert('Please provide either a document file or an external link', 'danger');
      return;
    }
    
    try {
      let documentUrl = courseForm.document_url;
      let imageUrl = courseForm.image_url;
      
      if (selectedFile) {
        documentUrl = await uploadFile();
        if (!documentUrl) return;
      }

      if (selectedImageFile) {
        imageUrl = await uploadImageFile();
        if (!imageUrl) return;
      } else if (!imageUrl) {
        // Use default image if no image is uploaded
        imageUrl = defaultCourseImage;
      }

      const courseData = {
        ...courseForm,
        price: 0, // Always free
        document_url: documentUrl || courseForm.document_url,
        image_url: imageUrl || courseForm.image_url
      };

      if (selectedCourse) {
        await axios.put(`http://localhost:5000/api/courses/${selectedCourse.id}`, courseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showAlert('Course updated successfully!', 'success');
      } else {
        await axios.post('http://localhost:5000/api/courses', courseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showAlert('Course created successfully!', 'success');
      }

      setShowCourseModal(false);
      setSelectedCourse(null);
      setCourseForm({
        title: '',
        description: '',
        category: 'Project Management',
        price: 0,
        duration: 0,
        image_url: '',
        document_url: '',
        external_link: ''
      });
      setSelectedFile(null);
      setSelectedImageFile(null);
      fetchData();
    } catch (error) {
      console.error('Error saving course:', error);
      showAlert('Error saving course', 'danger');
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price || 0,
      duration: course.duration || 0,
      image_url: course.image_url || '',
      document_url: course.document_url || '',
      external_link: course.external_link || ''
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showAlert('Course deleted successfully!', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting course:', error);
        showAlert('Error deleting course', 'danger');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCourseModal(false);
    setSelectedCourse(null);
    setCourseForm({
      title: '',
      description: '',
      category: 'Project Management',
      price: 0,
      duration: 0,
      image_url: '',
      document_url: '',
      external_link: ''
    });
    setSelectedFile(null);
    setSelectedImageFile(null);
  };

  const handleApproveCompletion = async () => {
    try {
      await axios.post(`http://localhost:5000/api/enrollments/${selectedApproval.id}/approve`, 
        { notes: approvalNotes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      showAlert('Completion approved successfully!', 'success');
      setShowApprovalModal(false);
      setSelectedApproval(null);
      setApprovalNotes('');
      fetchData();
    } catch (error) {
      console.error('Error approving completion:', error);
      showAlert('Error approving completion', 'danger');
    }
  };

  const handleRejectCompletion = async () => {
    try {
      await axios.post(`http://localhost:5000/api/enrollments/${selectedApproval.id}/reject`, 
        { notes: approvalNotes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      showAlert('Completion rejected', 'info');
      setShowApprovalModal(false);
      setSelectedApproval(null);
      setApprovalNotes('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting completion:', error);
      showAlert('Error rejecting completion', 'danger');
    }
  };

  const handleViewApproval = (approval) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  const getCompletionCount = (userId) => {
    return completedEnrollments.filter(e => e.user_id === userId).length;
  };



  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading admin panel...</p>
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
        {alert.show && (
          <Alert variant={alert.type} onClose={() => setAlert({ show: false, message: '', type: '' })} dismissible>
            {alert.message}
          </Alert>
        )}

        <Row className="mb-4">
          <Col>
            <h2 className="text-white mb-0">Admin Dashboard</h2>
            <p className="text-white-50">Manage courses, users, and completion approvals</p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="light" 
              onClick={() => setShowCourseModal(true)}
              className="shadow"
            >
              ➕ Add Course
            </Button>
          </Col>
        </Row>

      <Tabs defaultActiveKey="courses" className="mb-4">
        <Tab eventKey="courses" title="Course Management">
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h5>All Courses ({courses.length})</h5>
                </Col>
              </Row>

              {courses.length === 0 ? (
                <div className="text-center py-5">
                  <h4>No courses yet</h4>
                  <p className="text-muted">Create your first course to get started</p>
                </div>
              ) : (
                <Row>
                  {courses.map(course => (
                    <Col key={course.id} lg={4} md={6} className="mb-4">
                      <Card className="h-100 shadow border-0" style={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        borderRadius: '12px'
                      }}>
                        <Card.Img 
                          variant="top" 
                          src={course.image_url || defaultCourseImage}
                          style={{ height: '150px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
                          onError={(e) => {
                            e.target.src = defaultCourseImage;
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
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">
                                <FaLink className="me-1" />
                                {course.duration || 0} hours
                              </small>
                            </div>
                            <div className="d-flex gap-2">
                              <Button variant="outline-success" size="sm" onClick={() => handleEditCourse(course)} style={{ borderRadius: '25px' }}>✏️ Edit</Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCourse(course.id)} style={{ borderRadius: '25px' }}>🗑️ Delete</Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="users" title="User Management">
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h5>All Users ({users.length})</h5>
                </Col>
              </Row>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Completions</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'warning' : 'success'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info" className="me-2">
                          🎓 {getCompletionCount(user.id)}
                        </Badge>
                        {getCompletionCount(user.id) > 0 && (
                          <small className="text-muted">
                            {getCompletionCount(user.id)} course{getCompletionCount(user.id) !== 1 ? 's' : ''} completed
                          </small>
                        )}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="approvals" title="Completion Approvals">
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h5>Pending Completion Requests ({pendingApprovals.length})</h5>
                </Col>
              </Row>

              {pendingApprovals.length === 0 ? (
                <Card className="text-center py-5" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                  <Card.Body>
                    <h4>No pending approvals</h4>
                    <p className="text-muted">All completion requests have been processed</p>
                  </Card.Body>
                </Card>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Course</th>
                      <th>Requested</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map(approval => (
                      <tr key={approval.id}>
                        <td>{approval.user?.name}</td>
                        <td>{approval.course?.title}</td>
                        <td>{new Date(approval.completion_requested_at).toLocaleDateString()}</td>
                        <td>{approval.completion_notes || 'No notes'}</td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleViewApproval(approval)}
                            style={{ borderRadius: '25px' }}
                          >
                            👁️ Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="completions" title="Course Completions">
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h5>Completed Courses ({completedEnrollments.length})</h5>
                </Col>
              </Row>

              {completedEnrollments.length === 0 ? (
                <Card className="text-center py-5" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                  <Card.Body>
                    <h4>No completed courses yet</h4>
                    <p className="text-muted">Users will appear here once they complete courses</p>
                  </Card.Body>
                </Card>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Course</th>
                      <th>Completed</th>
                      <th>Approved By</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedEnrollments.map(enrollment => (
                      <tr key={enrollment.id}>
                        <td>
                          {enrollment.user?.name}
                          <Badge bg="success" className="ms-2">
                            🎓 {getCompletionCount(enrollment.user_id)}
                          </Badge>
                        </td>
                        <td>{enrollment.course?.title}</td>
                        <td>{new Date(enrollment.completed_at).toLocaleDateString()}</td>
                        <td>{enrollment.admin_approver?.name || 'System'}</td>
                        <td>{enrollment.completion_notes || 'No notes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Course Modal */}
      <Modal show={showCourseModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedCourse ? 'Edit Course' : 'Add New Course'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCourseSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                  >
                    <option value="Project Management">Project Management</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Technical">Technical</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (hours)</Form.Label>
                  <Form.Control
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: parseInt(e.target.value)})}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Course Image (Optional)</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageFileSelect}
                accept="image/*"
              />
              <Form.Text className="text-muted">
                {selectedImageFile ? `Selected: ${selectedImageFile.name}` : 'Choose an image file (JPG, PNG, GIF). If none selected, a default image will be used.'}
              </Form.Text>
              {selectedImageFile && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(selectedImageFile)} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                    className="border rounded"
                  />
                </div>
              )}
              {courseForm.image_url && !selectedImageFile && (
                <div className="mt-2">
                  <small className="text-muted">Current image:</small>
                  <img 
                    src={courseForm.image_url} 
                    alt="Current" 
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                    className="border rounded d-block mt-1"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Document File (Optional)</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
              />
              <Form.Text className="text-muted">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose a file to upload (PDF, DOC, DOCX, TXT)'}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>External Link (Optional)</Form.Label>
              <Form.Control
                type="url"
                value={courseForm.external_link}
                onChange={(e) => setCourseForm({...courseForm, external_link: e.target.value})}
                placeholder="https://example.com/resource"
              />
              <Form.Text className="text-muted">
                Provide either a document file or an external link (at least one is required)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCourseSubmit}>
            {selectedCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Approval Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Completion Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApproval && (
            <div>
              <h6>User: {selectedApproval.user?.name}</h6>
              <h6>Course: {selectedApproval.course?.title}</h6>
              <p><strong>Requested:</strong> {new Date(selectedApproval.completion_requested_at).toLocaleString()}</p>
              {selectedApproval.completion_notes && (
                <p><strong>Notes:</strong> {selectedApproval.completion_notes}</p>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>Admin Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleRejectCompletion}>
            ❌ Reject
          </Button>
          <Button variant="success" onClick={handleApproveCompletion}>
            ✅ Approve
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </div>
  );
};

export default Admin; 