import React, { useState, useEffect } from 'react';
import { buildApiUrl, getEndpoint } from '../config';

import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Tab, Tabs, Badge } from 'react-bootstrap';
import { FaLink } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Admin = () => {
  const { user } = useAuth();
  // State variables
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [completedEnrollments, setCompletedEnrollments] = useState([]);
  const [departments, setDepartments] = useState([]); // Added
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false); // Added
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(''); // For filtering
  const [selectedDepartmentForEdit, setSelectedDepartmentForEdit] = useState(null); // Added for editing
  const [approvalNotes, setApprovalNotes] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  
  // Filtered data states
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [filteredCompletions, setFilteredCompletions] = useState([]);
  
  // Filter states
  const [approvalDepartmentFilter, setApprovalDepartmentFilter] = useState('');
  const [completionDepartmentFilter, setCompletionDepartmentFilter] = useState('');
  const [completionUserFilter, setCompletionUserFilter] = useState('');

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Project Management',
    department: '',
    price: 0,
    duration: 0,
    image_url: '',
    document_url: '',
    external_link: ''
  });

  // Department form state
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    roles: ['']
  });

  // Default course image
  const defaultCourseImage = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize filtered arrays when data is loaded
  useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(users);
    }
    if (pendingApprovals.length > 0) {
      setFilteredApprovals(pendingApprovals);
    }
    if (completedEnrollments.length > 0) {
      setFilteredCompletions(completedEnrollments);
    }
  }, [users, pendingApprovals, completedEnrollments]);

  // Department filtering effects
  useEffect(() => {
    if (users.length > 0) {
      filterUsersByDepartment(selectedDepartment);
    }
  }, [users, selectedDepartment]);

  useEffect(() => {
    if (pendingApprovals.length > 0) {
      filterApprovalsByDepartment(approvalDepartmentFilter);
    }
  }, [pendingApprovals, approvalDepartmentFilter]);

  useEffect(() => {
    if (completedEnrollments.length > 0) {
      filterCompletionsByDepartment(completionDepartmentFilter, completionUserFilter);
    }
  }, [completedEnrollments, completionDepartmentFilter, completionUserFilter]);

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
      const coursesResponse = await axios.get(buildApiUrl(getEndpoint('COURSES')), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(coursesResponse.data);

      // Fetch users
      const usersResponse = await axios.get(buildApiUrl(getEndpoint('USERS')), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data);

      // Fetch pending approvals
      const pendingResponse = await axios.get(buildApiUrl(getEndpoint('ENROLLMENTS_PENDING_APPROVAL')), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingApprovals(pendingResponse.data);

      // Fetch completed enrollments
      const completedResponse = await axios.get(buildApiUrl(getEndpoint('ENROLLMENTS_COMPLETED')), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedEnrollments(completedResponse.data);

      // Fetch departments
      const departmentsResponse = await axios.get(buildApiUrl(getEndpoint('DEPARTMENTS')));
      setDepartments(departmentsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Department filtering functions
  const filterUsersByDepartment = (department) => {
    if (!department) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.department === department));
    }
  };

  const filterApprovalsByDepartment = (department) => {
    if (!department) {
      setFilteredApprovals(pendingApprovals);
    } else {
      setFilteredApprovals(pendingApprovals.filter(approval => approval.user_department === department));
    }
  };

  const filterCompletionsByDepartment = (department, userFilter = completionUserFilter) => {
    let filtered = completedEnrollments;
    
    // Filter by department
    if (department) {
      filtered = filtered.filter(completion => completion.user_department === department);
    }
    
    // Filter by user
    if (userFilter) {
      filtered = filtered.filter(completion => 
        completion.user?.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
        completion.user?.email?.toLowerCase().includes(userFilter.toLowerCase())
      );
    }
    
    setFilteredCompletions(filtered);
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
      const response = await axios.post(buildApiUrl(getEndpoint('UPLOAD')), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.url; // Return full URL instead of just filename
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
      const response = await axios.post(buildApiUrl(getEndpoint('UPLOAD')), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.url; // Return full URL from response
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
        console.log('Updating course:', selectedCourse.id, courseData);
        await axios.put(buildApiUrl(`/api/courses/${selectedCourse.id}`), courseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showAlert('Course updated successfully!', 'success');
      } else {
        console.log('Creating course:', courseData);
        await axios.post(buildApiUrl(getEndpoint('COURSES')), courseData, {
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
        department: '',
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
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error saving course';
      showAlert(errorMessage, 'danger');
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      department: course.department || '',
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
        await axios.delete(buildApiUrl(`/api/courses/${courseId}`), {
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
      department: '',
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
    if (window.confirm(`Are you sure you want to approve the completion request for "${selectedApproval.user?.name}" in course "${selectedApproval.course?.title}"?`)) {
      try {
        await axios.post(buildApiUrl(`/api/enrollments/${selectedApproval.id}/approve`), 
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
    }
  };

  const handleRejectCompletion = async () => {
    if (window.confirm(`Are you sure you want to reject the completion request for "${selectedApproval.user?.name}" in course "${selectedApproval.course?.title}"?`)) {
      try {
        await axios.post(buildApiUrl(`/api/enrollments/${selectedApproval.id}/reject`), 
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
    }
  };

  const handleViewApproval = (approval) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  // Get completion count for a user
  const getCompletionCount = (userId) => {
    return completedEnrollments.filter(e => e.user_id === userId).length;
  };

  // Calculate enrollment statistics for dashboard
  const getEnrollmentStats = () => {
    const totalEnrollments = users.length * courses.length; // Theoretical max
    const activeEnrollments = users.filter(user => 
      completedEnrollments.some(e => e.user_id === user.id)
    ).length;
    
    const completionRate = users.length > 0 ? ((activeEnrollments / users.length) * 100).toFixed(1) : 0;
    const avgCoursesPerUser = users.length > 0 ? (completedEnrollments.length / users.length).toFixed(1) : 0;
    
    return {
      totalEnrollments,
      activeEnrollments,
      completionRate,
      avgCoursesPerUser
    };
  };

  // User management functions
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(buildApiUrl(`/api/users/${userId}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        showAlert(`User "${userName}" deleted successfully`, 'success');
        fetchData(); // Refresh the data
      } catch (error) {
        console.error('Delete user error:', error);
        showAlert(error.response?.data?.message || 'Error deleting user', 'danger');
      }
    }
  };

  const handleBlockUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to block user "${userName}"? Blocked users cannot access the system.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(buildApiUrl(`/api/users/${userId}/block`), {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        showAlert(`User "${userName}" blocked successfully`, 'success');
        fetchData(); // Refresh the data
      } catch (error) {
        console.error('Block user error:', error);
        showAlert(error.response?.data?.message || 'Error blocking user', 'danger');
      }
    }
  };

  const handleUnblockUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to unblock user "${userName}"? They will be able to access the system again.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`buildApiUrl(getEndpoint('USERS')${userId}/unblock`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        showAlert(`User "${userName}" unblocked successfully`, 'success');
        fetchData(); // Refresh the data
      } catch (error) {
        console.error('Unblock user error:', error);
        showAlert(error.response?.data?.message || 'Error unblocking user', 'danger');
      }
    }
  };

  // Department management functions
  const handleCreateDepartment = async () => {
    try {
      const token = localStorage.getItem('token');
      const filteredRoles = departmentForm.roles.filter(role => role.trim() !== '');
      
      if (filteredRoles.length === 0) {
        showAlert('Please add at least one role', 'warning');
        return;
      }

      const departmentData = {
        name: departmentForm.name.trim(),
        description: departmentForm.description.trim(),
        roles: filteredRoles
      };

      await axios.post(buildApiUrl(getEndpoint('DEPARTMENTS')), departmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert('Department created successfully!', 'success');
      setShowDepartmentModal(false);
      setDepartmentForm({ name: '', description: '', roles: [''] });
      setSelectedDepartmentForEdit(null);
      fetchData();
    } catch (error) {
      console.error('Create department error:', error);
      showAlert(error.response?.data?.message || 'Error creating department', 'danger');
    }
  };

  const handleUpdateDepartment = async () => {
    try {
      const token = localStorage.getItem('token');
      const filteredRoles = departmentForm.roles.filter(role => role.trim() !== '');
      
      if (filteredRoles.length === 0) {
        showAlert('Please add at least one role', 'warning');
        return;
      }

      const departmentData = {
        name: departmentForm.name.trim(),
        description: departmentForm.description.trim(),
        roles: filteredRoles
      };

      console.log('Updating department:', selectedDepartmentForEdit.id, departmentData);
      console.log('Update URL:', buildApiUrl(`/api/departments/${selectedDepartmentForEdit.id}`));

      await axios.put(buildApiUrl(`/api/departments/${selectedDepartmentForEdit.id}`), departmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert('Department updated successfully!', 'success');
      setShowDepartmentModal(false);
      setDepartmentForm({ name: '', description: '', roles: [''] });
      setSelectedDepartmentForEdit(null);
      fetchData();
    } catch (error) {
      console.error('Update department error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error updating department';
      showAlert(errorMessage, 'danger');
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (window.confirm(`Are you sure you want to delete the "${departmentName}" department? This action cannot be undone and will affect existing users in this department.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(buildApiUrl(`/api/departments/${departmentId}`), {
          headers: { Authorization: `Bearer ${token}` }
        });

        showAlert(`Department "${departmentName}" deleted successfully`, 'success');
        fetchData();
      } catch (error) {
        console.error('Delete department error:', error);
        showAlert(error.response?.data?.message || 'Error deleting department', 'danger');
      }
    }
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartmentForEdit(department);
    setDepartmentForm({
      name: department.name,
      description: department.description || '',
      roles: [...department.roles, ''] // Add empty role for easy addition
    });
    setShowDepartmentModal(true);
  };

  const addRoleField = () => {
    setDepartmentForm(prev => ({
      ...prev,
      roles: [...prev.roles, '']
    }));
  };

  const removeRoleField = (index) => {
    if (departmentForm.roles.length > 1) {
      setDepartmentForm(prev => ({
        ...prev,
        roles: prev.roles.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRole = (index, value) => {
    setDepartmentForm(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) => i === index ? value : role)
    }));
  };

  const closeDepartmentModal = () => {
    setShowDepartmentModal(false);
    setSelectedDepartmentForEdit(null);
    setDepartmentForm({ name: '', description: '', roles: [''] });
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

      <Tabs defaultActiveKey="dashboard" className="mb-4">
        <Tab eventKey="dashboard" title="📊 Dashboard Insights">
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <Row className="mb-4">
                <Col>
                  <h4 className="text-primary mb-3">📈 LMS Analytics Overview</h4>
                </Col>
              </Row>

              {/* Key Metrics Cards */}
              <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{courses.length}</h2>
                      <p className="mb-0">Total Courses</p>
                      <small>Available for enrollment</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{users.length}</h2>
                      <p className="mb-0">Total Users</p>
                      <small>Registered learners</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{pendingApprovals.length}</h2>
                      <p className="mb-0">Pending Approvals</p>
                      <small>Awaiting admin review</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{completedEnrollments.length}</h2>
                      <p className="mb-0">Completed Courses</p>
                      <small>Successfully finished</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Additional Statistics Row */}
              <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{getEnrollmentStats().completionRate}%</h2>
                      <p className="mb-0">Completion Rate</p>
                      <small>Users who completed courses</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{getEnrollmentStats().avgCoursesPerUser}</h2>
                      <p className="mb-0">Avg Courses/User</p>
                      <small>Average completions per user</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{departments.length}</h2>
                      <p className="mb-0">Departments</p>
                      <small>Active departments</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                  <Card className="text-center border-0 shadow-sm" style={{ 
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    borderRadius: '15px'
                  }}>
                    <Card.Body className="text-white">
                      <h2 className="mb-2">{getEnrollmentStats().activeEnrollments}</h2>
                      <p className="mb-0">Active Learners</p>
                      <small>Users with completions</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Department Distribution */}
              <Row className="mb-4">
                <Col lg={6} className="mb-3">
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Header className="bg-light border-0">
                      <h6 className="mb-0">👥 Users by Department</h6>
                    </Card.Header>
                    <Card.Body>
                      {departments.length > 0 ? (
                        <div>
                          {departments.map(dept => {
                            const userCount = users.filter(user => user.department === dept.name).length;
                            const percentage = users.length > 0 ? ((userCount / users.length) * 100).toFixed(1) : 0;
                            return (
                              <div key={dept.name} className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="fw-medium">{dept.name}</span>
                                  <span className="text-muted">{userCount} users ({percentage}%)</span>
                                </div>
                                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ 
                                      width: `${percentage}%`,
                                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted text-center">No departments available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={6} className="mb-3">
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Header className="bg-light border-0">
                      <h6 className="mb-0">📚 Courses by Department</h6>
                    </Card.Header>
                    <Card.Body>
                      {departments.length > 0 ? (
                        <div>
                          {departments.map(dept => {
                            const courseCount = courses.filter(course => course.department === dept.name).length;
                            const percentage = courses.length > 0 ? ((courseCount / courses.length) * 100).toFixed(1) : 0;
                            return (
                              <div key={dept.name} className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="fw-medium">{dept.name}</span>
                                  <span className="text-muted">{courseCount} courses ({percentage}%)</span>
                                </div>
                                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ 
                                      width: `${percentage}%`,
                                      background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted text-center">No departments available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Recent Activity */}
              <Row>
                <Col lg={6} className="mb-3">
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Header className="bg-light border-0">
                      <h6 className="mb-0">🕒 Recent Completion Requests</h6>
                    </Card.Header>
                    <Card.Body>
                      {pendingApprovals.length > 0 ? (
                        <div>
                          {pendingApprovals.slice(0, 5).map(approval => (
                            <div key={approval.id} className="d-flex align-items-center mb-2 p-2" style={{ 
                              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                              borderRadius: '8px' 
                            }}>
                              <div className="me-3">
                                <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                  <span className="text-white">⏳</span>
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-medium">{approval.user?.name}</div>
                                <small className="text-muted">{approval.course?.title}</small>
                              </div>
                              <Badge bg="warning" className="ms-2">Pending</Badge>
                            </div>
                          ))}
                          {pendingApprovals.length > 5 && (
                            <div className="text-center mt-2">
                              <small className="text-muted">+{pendingApprovals.length - 5} more requests</small>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted text-center">No pending approvals</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={6} className="mb-3">
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Header className="bg-light border-0">
                      <h6 className="mb-0">🎯 System Health</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Course Coverage</span>
                          <span className="fw-medium">{departments.length > 0 ? 'Good' : 'Needs Setup'}</span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${departments.length > 0 ? 100 : 0}%`,
                              background: departments.length > 0 ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : '#dc3545'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>User Engagement</span>
                          <span className="fw-medium">
                            {completedEnrollments.length > 0 ? 'Active' : 'New'}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${completedEnrollments.length > 0 ? 100 : 50}%`,
                              background: completedEnrollments.length > 0 ? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Admin Workload</span>
                          <span className="fw-medium">
                            {pendingApprovals.length === 0 ? 'Clear' : pendingApprovals.length < 5 ? 'Manageable' : 'Busy'}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${pendingApprovals.length === 0 ? 0 : pendingApprovals.length < 5 ? 50 : 100}%`,
                              background: pendingApprovals.length === 0 ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : 
                                         pendingApprovals.length < 5 ? 'linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)' : 
                                         'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

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
                            <Badge bg="primary" className="me-2" style={{ borderRadius: '20px' }}>{course.department}</Badge>
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
                <Col md={6}>
                  <h5>All Users ({filteredUsers.length})</h5>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Completions</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg="primary" style={{ borderRadius: '20px' }}>
                          {user.department || 'Admin'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'warning' : 'success'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.status === 'blocked' ? 'danger' : 'success'} style={{ borderRadius: '20px' }}>
                          {user.status === 'blocked' ? '🚫 Blocked' : '✅ Active'}
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
                      <td>
                        {user.role !== 'admin' && (
                          <div className="d-flex gap-1">
                            {user.status === 'blocked' ? (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleUnblockUser(user.id, user.name)}
                                title="Unblock User"
                              >
                                🔓
                              </Button>
                            ) : (
                                                                    <Button
                                        size="sm"
                                        variant="warning"
                                        onClick={() => handleBlockUser(user.id, user.name)}
                                        title="Block User"
                                      >
                                        🚫
                                      </Button>
                            )}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              title="Delete User"
                            >
                              🗑️
                            </Button>
                          </div>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-muted">Admin</span>
                        )}
                      </td>
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
                <Col md={6}>
                  <h5>Pending Completion Requests ({filteredApprovals.length})</h5>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={approvalDepartmentFilter}
                    onChange={(e) => setApprovalDepartmentFilter(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {filteredApprovals.length === 0 ? (
                <Card className="text-center py-5" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                  <Card.Body>
                    <h4>No pending approvals</h4>
                    <p className="text-muted">
                      {approvalDepartmentFilter 
                        ? `No pending approvals for ${approvalDepartmentFilter} department`
                        : 'All completion requests have been processed'
                      }
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Department</th>
                      <th>Course</th>
                      <th>Requested</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovals.map(approval => (
                      <tr key={approval.id}>
                        <td>{approval.user?.name}</td>
                        <td>
                          <Badge bg="primary" style={{ borderRadius: '20px' }}>
                            {approval.user?.department || 'N/A'}
                          </Badge>
                        </td>
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
                <Col md={4}>
                  <h5>Completed Courses ({filteredCompletions.length})</h5>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={completionDepartmentFilter}
                    onChange={(e) => setCompletionDepartmentFilter(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by user name or email..."
                    value={completionUserFilter}
                    onChange={(e) => setCompletionUserFilter(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  />
                </Col>
              </Row>

              {filteredCompletions.length === 0 ? (
                <Card className="text-center py-5" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                  <Card.Body>
                    <h4>No completed courses yet</h4>
                    <p className="text-muted">
                      {completionDepartmentFilter || completionUserFilter
                        ? `No completed courses found${completionDepartmentFilter ? ` in ${completionDepartmentFilter} department` : ''}${completionUserFilter ? ` for "${completionUserFilter}"` : ''}`
                        : 'Users will appear here once they complete courses'
                      }
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Department</th>
                      <th>Course</th>
                      <th>Completed</th>
                      <th>Approved By</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompletions.map(enrollment => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.user?.name}</td>
                        <td>
                          <Badge bg="primary" style={{ borderRadius: '20px' }}>
                            {enrollment.user?.department || 'N/A'}
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

        <Tab eventKey="departments" title="Department Management">
          <Card className="shadow-lg border-0" style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h5>Departments & Roles ({departments.length})</h5>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowDepartmentModal(true)}
                    className="shadow"
                  >
                    ➕ Add Department
                  </Button>
                </Col>
              </Row>

              {departments.length === 0 ? (
                <div className="text-center py-5">
                  <h4>No departments yet</h4>
                  <p className="text-muted">Create your first department to get started</p>
                </div>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Description</th>
                      <th>Available Roles</th>
                      <th>Users Count</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(department => (
                      <tr key={department.id}>
                        <td>
                          <strong>{department.name}</strong>
                        </td>
                        <td>{department.description || 'No description'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {department.roles.map((role, index) => (
                              <Badge key={index} bg="info" style={{ borderRadius: '15px' }}>
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">
                            {users.filter(user => user.department === department.name).length} users
                          </Badge>
                        </td>
                        <td>{new Date(department.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEditDepartment(department)}
                              title="Edit Department"
                            >
                              ✏️
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteDepartment(department.id, department.name)}
                              title="Delete Department"
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department *</Form.Label>
                  <Form.Select
                    value={courseForm.department}
                    onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
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

      {/* Department Modal */}
      <Modal show={showDepartmentModal} onHide={closeDepartmentModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedDepartmentForEdit ? 'Edit Department' : 'Add New Department'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={selectedDepartmentForEdit ? handleUpdateDepartment : handleCreateDepartment}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Available Roles (at least one)</Form.Label>
              {departmentForm.roles.map((role, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <Form.Control
                    type="text"
                    value={role}
                    onChange={(e) => updateRole(index, e.target.value)}
                    placeholder={`Role ${index + 1}`}
                    style={{ width: 'calc(100% - 150px)' }}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeRoleField(index)}
                    className="ms-2"
                    style={{ borderRadius: '20px' }}
                  >
                    ✖️
                  </Button>
                </div>
              ))}
              <Button variant="outline-primary" onClick={addRoleField} className="mt-2">
                Add Role
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDepartmentModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={selectedDepartmentForEdit ? handleUpdateDepartment : handleCreateDepartment}>
            {selectedDepartmentForEdit ? 'Update Department' : 'Create Department'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </div>
  );
};

export default Admin; 