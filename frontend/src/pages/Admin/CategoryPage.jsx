import { useEffect, useState } from 'react';
import NavBarLeft from '../../components/Admin/NavBarLeft';
import NavBarTop from '../../components/Admin/NavBarTop';
import { getAll, createCategory, updateCategory, deleteCategory } from '../../api/questionApi';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from "../../components/common/Notification";
import { Modal, Button, Form, Card, Badge, InputGroup, FormControl, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { 
  FcFolder, 
  FcOpenedFolder, 
  FcQuestions, 
  FcSearch, 
  FcFullTrash, 
  FcSettings 
} from "react-icons/fc";
import { FiEdit3, FiTrash2, FiEye, FiPlusCircle, FiFilter, FiCalendar, FiRefreshCw } from "react-icons/fi";
import '../../styles/Assessments.css';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAll();
      setCategories(res);
      setFilteredCategories(res);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError('Failed to load categories');
      setLoading(false);
    }
  };

  // Search and filter functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save new category
  const handleSaveCategory = async () => {
    try {
      if (!formData.name.trim()) {
        showError('Category name is required');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData || !userData.id) {
        console.error('User data not found or missing id');
        showError('User authentication error');
        return;
      }
      
      const categoryData = {
        ...formData,
        createdBy: userData.id
      };
      
      setLoading(true);
      const response = await createCategory(categoryData);
      setCategories([...categories, response]);
      showSuccess('Category created successfully!');
      handleCloseModals();
      setLoading(false);
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Failed to create category!');
      setLoading(false);
    }
  };

  // Update existing category
  const handleUpdateCategory = async () => {
    try {
      if (!formData.name.trim()) {
        showError('Category name is required');
        return;
      }

      if (!selectedCategory || !selectedCategory._id) {
        showError('Invalid category selected');
        return;
      }
      
      setLoading(true);
      const response = await updateCategory(selectedCategory._id, formData);
      
      setCategories(categories.map(cat => 
        cat._id === selectedCategory._id ? response : cat
      ));
      
      showSuccess('Category updated successfully!');
      handleCloseModals();
      setLoading(false);
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Failed to update category!');
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryId, categoryName) => {
    Swal.fire({
      title: 'Delete Category?',
      html: `Are you sure you want to delete <strong>${categoryName}</strong>?<br><br>All quizzes in this category will be affected.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      backdrop: true,
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await deleteCategory(categoryId);
          setCategories(categories.filter(cat => cat._id !== categoryId));
          showSuccess('Category deleted successfully!');
          setLoading(false);
        } catch (error) {
          console.error('Error deleting category:', error);
          showError('Failed to delete category!');
          setLoading(false);
        }
      }
    });
  };

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };
  
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);
  
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    }
    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return 'Today';
  };

  // Tooltip rendering function
  const renderTooltip = (text) => (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  return (
    <div className="admin-dashboard">
      <div className='sidebar admin-layout'>
        <NavBarLeft />
      </div>
      <div className='home-section'>
        <NavBarTop />
        <div className="content-wrapper">
          <Card className="admin-card shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <FcOpenedFolder size={36} className="me-3" />
                  <div>
                    <h4 className="mb-0 fw-bold">Categories</h4>
                    <p className="text-muted mb-0 small">Manage quiz categories and their related content</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-secondary" 
                    className="d-flex align-items-center"
                    onClick={fetchCategories}
                  >
                    <FiRefreshCw className="me-2" /> Refresh
                  </Button>
                  <Button 
                    variant="primary" 
                    className="d-flex align-items-center shadow-sm"
                    onClick={handleOpenAddModal}
                  >
                    <FiPlusCircle className="me-2" /> Add Category
                  </Button>
                </div>
              </div>

              <div className="filter-bar d-flex flex-column flex-md-row align-items-center mb-4 gap-3">
                <InputGroup className="search-bar flex-md-grow-1">
                  <InputGroup.Text className="bg-light border-end-0">
                    <FcSearch size={20} />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search categories by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 py-2"
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm('')}
                      className="border-start-0"
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
                <div className="d-flex align-items-center">
                  <span className="text-muted small me-2">
                    {filteredCategories.length} of {categories.length} categories
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading categories...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover categories-table align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th scope="col" className="ps-4" width="40">#</th>
                        <th scope="col">
                          <div className="d-flex align-items-center">
                            <FcFolder className="me-2" />
                            Category
                          </div>
                        </th>
                        <th scope="col">Description</th>
                        <th scope="col" width="130">Created</th>
                        <th scope="col" width="120">Last Updated</th>
                        <th scope="col" width="180" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                          <motion.tr 
                            key={category._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="category-row"
                          >
                            <td className="ps-4 fw-medium text-muted">{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="category-icon-wrapper me-3">
                                  <FcFolder size={24} />
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-bold">{category.name}</h6>
                                  <div className="d-flex align-items-center mt-1">
                                    <Link 
                                      to={`/admin/category/${category._id}/quizzes`}
                                      className="badge bg-light text-primary d-flex align-items-center gap-1 text-decoration-none"
                                    >
                                      <FcQuestions size={14} /> 
                                      View Quizzes
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-muted">
                              {category.description && category.description.length > 100 
                                ? `${category.description.substring(0, 100)}...` 
                                : category.description || 'No description provided'}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FiCalendar size={14} className="text-muted me-2" />
                                <span>{formatDate(category.createAt || category.createdAt)}</span>
                              </div>
                            </td>
                            <td>
                              <Badge bg="light" text="dark" className="update-badge">
                                {getTimeAgo(category.updatedAt || category.createAt || category.createdAt)}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <OverlayTrigger placement="top" overlay={renderTooltip("View Quizzes")}>
                                  <Link
                                    to={`/admin/category/${category._id}/quizzes`}
                                    className="btn btn-sm btn-light action-btn"
                                  >
                                    <FiEye className="action-icon" />
                                  </Link>
                                </OverlayTrigger>
                                
                                <OverlayTrigger placement="top" overlay={renderTooltip("Edit Category")}>
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="action-btn"
                                    onClick={() => handleOpenEditModal(category)}
                                  >
                                    <FiEdit3 className="action-icon" />
                                  </Button>
                                </OverlayTrigger>
                                
                                <OverlayTrigger placement="top" overlay={renderTooltip("Delete Category")}>
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteCategory(category._id, category.name)}
                                  >
                                    <FiTrash2 className="action-icon" />
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <FcFullTrash size={48} className="mb-3 d-block mx-auto" />
                            <h6>No categories found</h6>
                            <p className="text-muted mb-0">
                              {searchTerm ? 
                                'Try changing your search criteria' : 
                                'Create a new category to get started'}
                            </p>
                            {searchTerm && (
                              <Button 
                                variant="link" 
                                className="mt-2"
                                onClick={() => setSearchTerm('')}
                              >
                                Clear search
                              </Button>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title as="h5" className="text-primary d-flex align-items-center">
            <FiPlusCircle className="me-2" />
            Create New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Category Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a descriptive name"
                required
                autoFocus
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                Choose a clear and specific name for easy identification
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose or content of this category"
                rows={4}
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                A good description helps users understand what types of quizzes belong here
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveCategory}
            className="px-4"
            disabled={!formData.name.trim()}
          >
            Create Category
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title as="h5" className="text-primary d-flex align-items-center">
            <FiEdit3 className="me-2" />
            Edit Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Category Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
                autoFocus
                className="form-control-lg"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows={4}
                className="form-control-lg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateCategory}
            className="px-4"
            disabled={!formData.name.trim()}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoryPage;
