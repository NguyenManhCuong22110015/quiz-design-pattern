import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { updateQuestion } from '../../api/questionApi';
import { uploadMedia } from '../../api/mediaApi'; 
import { toast } from 'react-toastify';
import CreateLoading from '../common/CreateLoading';
import { ButtonGroup, Card, ProgressBar } from 'react-bootstrap';
import { showSuccess } from '../common/Notification';

// Đổi tham số từ onUpdate thành onSubmit cho rõ nghĩa
const EditQuestionModal = ({ show, onClose, question, onSubmit }) => {
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    points: 1,
    time: 30,
    required: true,
    options: [],
    type: '',
    media: {
      type: null, // 'image', 'audio', or 'video'
      url: '',
      file: null
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text || '',
        description: question.description || '',
        points: question.points || 1,
        time: question.time || 30,
        required: question.required !== undefined ? question.required : true,
        options: question.options || [],
        type: question.type || '',
        media: {
          type: question.mediaType || null,
          url: question.media || '',
          file: null
        }
      });
    }
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOptionTextChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].option = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleIsCorrectChange = (index) => {
    const newOptions = [...formData.options];
    
    // For single choice questions, only one option can be correct
    if (formData.type === 'single' || formData.type === 'boolean') {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      // For multiple choice, toggle the current option
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
    }
    
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { option: '', isCorrect: false }]
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // Handle media type selection
  const handleMediaTypeSelect = (mediaType) => {
    // If selecting the same media type that's already active, do nothing
    if (formData.media.type === mediaType) return;
    
    // Clear any existing media when changing types
    setFormData({
      ...formData,
      media: {
        type: mediaType,
        url: '',
        file: null
      }
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle media file selection
  const handleMediaFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const mediaType = formData.media.type;
    const validTypes = {
      'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      'video': ['video/mp4', 'video/webm', 'video/ogg']
    };
    
    // Validate file type
    if (!validTypes[mediaType]?.includes(file.type)) {
      toast.error(`Invalid file type. Please upload a valid ${mediaType} file.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 10MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Set file in state for preview
    setFormData({
      ...formData,
      media: {
        ...formData.media,
        file: file,
        url: URL.createObjectURL(file) // Create local URL for preview
      }
    });
    
    try {
      // Start upload immediately
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create form data for upload
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);
      mediaFormData.append('type', mediaType);
      
      // Call API to upload media
      const response = await uploadMedia(mediaFormData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });
      
      // Update state with the server URL
      setFormData(prevState => ({
        ...prevState,
        media: {
          ...prevState.media,
          url: response.url // Use the URL returned from server
        }
      }));
      
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media. Please try again.');
      
      // Reset media on error
      setFormData(prevState => ({
        ...prevState,
        media: {
          ...prevState.media,
          file: null,
          url: ''
        }
      }));
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Clear media
  const handleClearMedia = () => {
    setFormData({
      ...formData,
      media: {
        type: formData.media.type, // Keep the selected type
        url: '',
        file: null
      }
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.text.trim()) {
        toast.error('Question text is required');
        setIsSubmitting(false);
        return;
      }

      if (formData.options.length > 0) {
        const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error('Please select at least one correct answer');
          setIsSubmitting(false);
          return;
        }
      }

      // Format data for API
      const updatedQuestion = {
        id: question._id,
        text: formData.text,
        description: formData.description,
        points: parseInt(formData.points),
        time: parseInt(formData.time),
        required: formData.required,
        options: formData.options,
        type: formData.type,
       
      };

      const response = await updateQuestion(updatedQuestion);
      
      showSuccess('Question updated successfully');
      
      if (onSubmit) {
        onSubmit(response);
      }
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renders appropriate input based on question type
  const renderTypeSpecificFields = () => {
    if (!formData.type || !formData.options) return null;

    if (['multiple', 'single', 'boolean'].includes(formData.type)) {
      return (
        <Form.Group className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label>Answer Options</Form.Label>
            {formData.type !== 'boolean' && (
              <Button 
                size="sm" 
                variant="outline-success" 
                onClick={handleAddOption}
              >
                <i className="bi bi-plus-circle me-1"></i> Add Option
              </Button>
            )}
          </div>
          
          {formData.options.map((option, index) => (
            <div className="d-flex align-items-center mb-2" key={index}>
              <div className="me-2">
                {formData.type === 'multiple' ? (
                  <Form.Check 
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={() => handleIsCorrectChange(index)}
                    id={`option-correct-${index}`}
                  />
                ) : (
                  <Form.Check 
                    type="radio"
                    name="correctOption"
                    checked={option.isCorrect}
                    onChange={() => handleIsCorrectChange(index)}
                    id={`option-correct-${index}`}
                  />
                )}
              </div>
              
              <Form.Control
                type="text"
                value={option.option}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                disabled={formData.type === 'boolean'}
                className="me-2"
              />
              
              {formData.type !== 'boolean' && formData.options.length > 2 && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => handleRemoveOption(index)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              )}
            </div>
          ))}
        </Form.Group>
      );
    }
    
    if (formData.type === 'number') {
      return (
        <div className="alert alert-info">
          This is a number response question. Students will enter a numeric value.
        </div>
      );
    }
    
    if (formData.type === 'text') {
      return (
        <div className="alert alert-info">
          This is a text response question. Students will enter free-form text.
        </div>
      );
    }
    
    return null;
  };

  // Render media preview based on media type
  const renderMediaPreview = () => {
    const { media } = formData;
    if (!media || !media.url) return null;

    if (media.type === 'image') {
      return (
        <Card className="mb-3">
          <Card.Img 
            variant="top" 
            src={media.url} 
            style={{ maxHeight: '200px', objectFit: 'contain' }} 
          />
        </Card>
      );
    }

    if (media.type === 'audio') {
      return (
        <Card className="mb-3">
          <Card.Body>
            <audio controls className="w-100">
              <source src={media.url} />
              Your browser does not support the audio element.
            </audio>
          </Card.Body>
        </Card>
      );
    }

    if (media.type === 'video') {
      return (
        <Card className="mb-3">
          <Card.Body>
            <video controls className="w-100" style={{ maxHeight: '200px' }}>
              <source src={media.url} />
              Your browser does not support the video element.
            </video>
          </Card.Body>
        </Card>
      );
    }

    return null;
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Question Text <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter question text"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional additional information"
              />
            </Form.Group>
            
            {/* Media Selection */}
            <Form.Group className="mb-4">
              <Form.Label>Media (Optional)</Form.Label>
              <Card className="border-light mb-3">
                <Card.Body>
                  <h6 className="mb-3">Select Media Type:</h6>
                  <ButtonGroup className="mb-3 w-100">
                    <Button
                      variant={formData.media.type === 'image' ? 'primary' : 'outline-primary'}
                      onClick={() => handleMediaTypeSelect('image')}
                    >
                      <i className="bi bi-image me-1"></i> Image
                    </Button>
                    <Button
                      variant={formData.media.type === 'audio' ? 'primary' : 'outline-primary'}
                      onClick={() => handleMediaTypeSelect('audio')}
                    >
                      <i className="bi bi-music-note-beamed me-1"></i> Audio
                    </Button>
                    <Button
                      variant={formData.media.type === 'video' ? 'primary' : 'outline-primary'}
                      onClick={() => handleMediaTypeSelect('video')}
                    >
                      <i className="bi bi-camera-video me-1"></i> Video
                    </Button>
                  </ButtonGroup>
                  
                  {formData.media.type && (
                    <>
                      <div className="mb-3">
                        <Form.Control
                          type="file"
                          ref={fileInputRef}
                          onChange={handleMediaFileChange}
                          accept={
                            formData.media.type === 'image' ? 'image/*' :
                            formData.media.type === 'audio' ? 'audio/*' :
                            'video/*'
                          }
                          disabled={isUploading}
                        />
                        <Form.Text className="text-muted">
                          {formData.media.type === 'image' ? 'Supported formats: JPG, PNG, GIF, WebP' :
                           formData.media.type === 'audio' ? 'Supported formats: MP3, WAV, OGG' :
                           'Supported formats: MP4, WebM, OGG'} (Max: 10MB)
                        </Form.Text>
                      </div>
                      
                      {isUploading && (
                        <div className="mb-3">
                          <ProgressBar 
                            now={uploadProgress} 
                            label={`${uploadProgress}%`} 
                            animated
                            variant="info"
                          />
                        </div>
                      )}
                      
                      {renderMediaPreview()}
                      
                      {formData.media.url && (
                        <div className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleClearMedia}
                            disabled={isUploading}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Clear Media
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Form.Group>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Points</Form.Label>
                  <Form.Control
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="1"
                  />
                  <Form.Text className="text-muted">
                    Points awarded for a correct answer
                  </Form.Text>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Time (seconds)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    min="5"
                  />
                  <Form.Text className="text-muted">
                    Time allowed to answer this question
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-4">
              <Form.Check 
                type="switch"
                id="required-switch"
                label="This question is required"
                name="required"
                checked={formData.required}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            {renderTypeSpecificFields()}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose} className="me-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      <CreateLoading isVisible={isSubmitting} />
    </>
  );
};

export default EditQuestionModal;