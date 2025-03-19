import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { showSuccess, showError } from '../common/Notification';
import { uploadImage } from '../../api/mediaApi';
import CreateLoading from '../common/CreateLoading';


const AddQuizzModal = ({ show, handleClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Animal');
  const [level, setLevel] = useState('easy');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Animal');
    setLevel('easy');
    setImage(null);
    setImagePreview(null);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = '';
      
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const imageResponse = await uploadImage(formData);
        console.log('Image uploaded:', imageResponse);
        imageUrl = imageResponse.imageUrl;
      }
      const quizData = {
        title,
        description,
        category,
        level,
        imageUrl
      };
      
      onSave(quizData);
      resetForm();
      handleClose();
      showSuccess('Quiz created successfully!');
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      showError('Failed to create quiz');
    } finally {
      setIsUploading(false);
    }
  };
   const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };
 


  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Quiz</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter quiz title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Enter quiz description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select 
              value={category} 
              onChange={handleCategoryChange}
              required
            >
              <option value="General Knowledge">General Knowledge</option>
              <option value="Animal">Animal</option>
              
            </Form.Select>
           
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Difficulty Level</Form.Label>
            <Form.Select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Cover Image</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px',
                    objectFit: 'cover'
                  }} 
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            resetForm();
            handleClose();
          }}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? 'Creating...' : 'Create Quiz'}
          </Button>
        </Modal.Footer>
      </Form>
      <CreateLoading isVisible={isUploading} />
    </Modal>
  );
};

export default AddQuizzModal;
