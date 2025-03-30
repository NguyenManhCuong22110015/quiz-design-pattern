import { useEffect, useState } from 'react';
import NavBarLeft from '../../components/Admin/NavBarLeft';
import '../../styles/Assessments.css';
import NavBarTop from '../../components/Admin/NavBarTop';
import { getAll, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from "../../components/common/Notification";
import { FcFolder } from "react-icons/fc";
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const userId = JSON.parse(localStorage.getItem('user')).id || 1
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAll();
        setCategories(res);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showError('Failed to load categories');
      }
    };
    fetchCategories();
  }, [userId]);

  // Sidebar toggle effect
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.querySelector("#btn");
    
    const menuBtnChange = () => {
      if (sidebar?.classList.contains("open")) {
        closeBtn?.classList.replace("bx-menu", "bx-menu-alt-right");
      } else {
        closeBtn?.classList.replace("bx-menu-alt-right", "bx-menu");
      }
    };

    const handleClick = () => {
      sidebar?.classList.toggle("open");
      menuBtnChange();
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", handleClick);
    }

    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener("click", handleClick);
      }
    };
  }, []);

  // Modal handlers
  const handleOpenAddModal = () => {
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description
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
      
      const response = await createCategory(categoryData);
      setCategories([...categories, response]);
      showSuccess('Category created successfully!');
      handleCloseModals();
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Failed to create category!');
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
      console.log(selectedCategory._id)
      const response = await updateCategory(selectedCategory._id, formData);
      
      
      
      setCategories(categories.map(cat => 
        cat._id === selectedCategory._id ? response : cat
      ));
      
      showSuccess('Category updated successfully!');
      handleCloseModals();
    } catch (error) {
      console.error('Error updating category:', error);
      showError('Failed to update category!');
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! All quizzes in this category will be affected.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(categoryId);
          setCategories(categories.filter(cat => cat._id !== categoryId));
          showSuccess('Category deleted successfully!');
        } catch (error) {
          console.error('Error deleting category:', error);
          showError('Failed to delete category!');
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

  return (
    <>
      <div className='sidebar admin-layout'>
        <NavBarLeft />
      </div>
      <div className='home-section mt-5'>
        <NavBarTop />
        <div className="container-fluid admin-content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">
              <FcFolder className="me-2" />
              Categories
            </h3>
            <button className="btn btn-success" onClick={handleOpenAddModal}>
              <i className="bi bi-folder-plus me-2"></i>
              Add Category
            </button> 
          </div>
          
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="text-center" width="60">#</th>
                  <th scope="col" width="200">Category Name</th>
                  <th scope="col">Description</th>
                  <th scope="col" width="120" className="text-center">Created at</th>
                  <th scope="col" width="120" className="text-center">Updated</th>
                  <th scope="col" width="160" className="text-center">Actions</th>
                  <th scope="col" width="160" className="text-center">Quizzes</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <tr key={category._id}>
                      <th scope="row" className="text-center align-middle">{index + 1}</th>
                      <td className="fw-bold align-middle">{category.name}</td>
                      <td className="align-middle text-muted">
                        {category.description && category.description.length > 100 
                          ? `${category.description.substring(0, 100)}...` 
                          : category.description || 'No description'}
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-light text-dark">
                          {formatDate(category.createAt || category.createdAt)}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span className="badge bg-secondary text-white">
                          {getTimeAgo(category.updatedAt || category.createAt || category.createdAt)}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="btn-group" role="group">
                          <button 
                            onClick={() => handleOpenEditModal(category)}
                            className="btn btn-outline-primary btn-sm me-2"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <Link 
                          to={`/admin/category/${category._id}/quizzes`} 
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="bi bi-collection me-1"></i> View Quizzes
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <i className="bi bi-folder-x me-2 fs-4"></i>
                      No categories available. Create one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-folder-plus me-2"></i>
            Add New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows={3}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveCategory}>
            Create Category
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Edit Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows={3}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateCategory}>
            Update Category
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CategoryPage;