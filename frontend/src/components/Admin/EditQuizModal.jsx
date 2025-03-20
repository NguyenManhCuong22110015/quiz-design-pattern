import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {uploadImage} from '../../api/mediaApi';
const EditQuizModal = ({ show, handleClose, quiz, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    category: '',
    level: 'easy' // Default level
  });
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Categories list - you can fetch this from API if needed
  const categories = [
    'Programming', 
    'Mathematics', 
    'Science', 
    'History', 
    'Geography', 
    'Literature',
    'General Knowledge'
  ];

  // Difficulty levels
  const levels = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        image: null,
        category: quiz.category || '',
        level: quiz.level || 'easy'
      });
      setPreviewImage(quiz.image || '');
    }
  }, [quiz]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a valid image.');
      fileInputRef.current.value = '';
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 2MB.');
      fileInputRef.current.value = '';
      return;
    }

    // Update form data with file
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    // Create preview URL
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the quiz');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create form data for submission
      let imageUrl = null;
    if (formData.image) {
      const imageFormData = new FormData();
      imageFormData.append('image', formData.image);
      
      // Giả sử bạn có API riêng để upload ảnh
      const uploadResponse = await uploadImage(imageFormData);
      imageUrl = uploadResponse.imageUrl;
    }
    
    // Sau đó gửi dữ liệu dưới dạng JSON thông thường
    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      image: imageUrl // Sử dụng URL của ảnh đã upload
    };

   

      await onUpdate(quiz._id, submitData);
      
      handleClose();
      toast.success('Quiz updated successfully!');
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Quiz</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Quiz Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter quiz title"
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
              placeholder="Enter quiz description"
              rows={3}
            />
          </Form.Group>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  name="category" 
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Difficulty Level</Form.Label>
                <Form.Select 
                  name="level" 
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Label>Quiz Image</Form.Label>
            <div className="d-flex align-items-center mb-2">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="me-2"
              />
              {previewImage && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleClearImage}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              )}
            </div>
            
            {previewImage && (
              <div className="mt-2 position-relative">
                <img 
                  src={previewImage} 
                  alt="Quiz preview" 
                  className="img-thumbnail" 
                  style={{ maxHeight: '150px' }}
                />
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : 'Update Quiz'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditQuizModal;