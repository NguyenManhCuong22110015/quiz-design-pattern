import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { updateQuestion } from '../../api/questionApi';
import { uploadMedia, uploadImage, uploadVideo, uploadAudio } from '../../api/mediaApi'; 
import { toast } from 'react-toastify';
import CreateLoading from '../common/CreateLoading';
import { ButtonGroup, Card, ProgressBar, Row, Col } from 'react-bootstrap';
import { showSuccess, showError } from '../common/Notification';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faQuestionCircle, 
  faGripVertical, 
  faMinusCircle, 
  faPlusCircle, 
  faSave, 
  faImage,
  faMusic,
  faVideo,
  faUpload,
  faTrash,
  faCheck
} from "@fortawesome/free-solid-svg-icons";

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
    },
    sort: 'alphabetical',       // How to sort options: 'alphabetical' or 'custom'
    layout: 'radio_buttons',    // How to display options: 'radio_buttons', 'checkboxes', or 'dropdown'
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
        },
        sort: question.sort || 'alphabetical',
        layout: question.layout || (question.type === 'multiple' ? 'checkboxes' : 'radio_buttons')
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
    // Don't allow removing if there are fewer than 2 options
    if (formData.options.length <= 2) {
      toast.warning("A question must have at least 2 options");
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  // Handle media type selection
  const handleMediaTypeSelect = (mediaType) => {
    // If selecting the same media type that's already active, clear it
    if (formData.media.type === mediaType) {
      setFormData({
        ...formData,
        media: {
          type: null,
          url: '',
          file: null
        }
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
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
  const handleMediaFileChange = (e) => {
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

  // Media upload function
  const handleMediaUpload = async () => {
    if (!formData.media.file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let response;
      const mediaFormData = new FormData();
      
      if (formData.media.type === 'image') {
        mediaFormData.append('image', formData.media.file);
        response = await uploadImage(mediaFormData, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        });
        
        if (response && response.imageUrl) {
          setFormData({
            ...formData,
            media: {
              ...formData.media,
              url: response.imageUrl
            }
          });
          showSuccess("Image uploaded successfully");
        } else {
          throw new Error("Failed to get image URL from response");
        }
      } 
      else if (formData.media.type === 'audio') {
        mediaFormData.append('audio', formData.media.file);
        response = await uploadAudio(mediaFormData, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        });
        
        if (response && response.url) {
          setFormData({
            ...formData,
            media: {
              ...formData.media,
              url: response.url
            }
          });
          showSuccess("Audio uploaded successfully");
        } else {
          throw new Error("Failed to get audio URL from response");
        }
      } 
      else if (formData.media.type === 'video') {
        mediaFormData.append('video', formData.media.file);
        response = await uploadVideo(mediaFormData, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        });
        
        if (response && response.url) {
          setFormData({
            ...formData,
            media: {
              ...formData.media,
              url: response.url
            }
          });
          showSuccess("Video uploaded successfully");
        } else {
          throw new Error("Failed to get video URL from response");
        }
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      showError(`Failed to upload ${formData.media.type}. Please try again.`);
    } finally {
      setIsUploading(false);
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
        media: formData.media.url,
        mediaType: formData.media.type,
        sort: formData.sort,
        layout: formData.layout
      };

      const response = await updateQuestion(updatedQuestion);
      
      showSuccess('Question updated successfully!');
      
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
            <Form.Label>Answer Options <span className="text-danger">*</span></Form.Label>
            {formData.type !== 'boolean' && (
              <Button 
                size="sm" 
                variant="outline-success" 
                onClick={handleAddOption}
              >
                <FontAwesomeIcon icon={faPlusCircle} className="me-1" /> Add Option
              </Button>
            )}
          </div>
          
          <div className="border rounded p-3 bg-light">
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
                
                <div className="me-2">
                  <FontAwesomeIcon icon={faGripVertical} className="text-muted" />
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
                    <FontAwesomeIcon icon={faMinusCircle} />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="mt-2 text-center text-muted small">
              {formData.type === 'multiple' 
                ? "✓ Select all correct answers" 
                : "○ Select the single correct answer"}
            </div>
          </div>
        </Form.Group>
      );
    }
    
    if (formData.type === 'number') {
      return (
        <div className="alert alert-info">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faQuestionCircle} className="me-2" size="lg" />
            <div>
              <h5 className="mb-1">Number Response Question</h5>
              <p className="mb-0">
                Students will enter a numeric value as their answer. You can specify the correct number(s) in the options.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (formData.type === 'text') {
      return (
        <div className="alert alert-info">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faQuestionCircle} className="me-2" size="lg" />
            <div>
              <h5 className="mb-1">Text Response Question</h5>
              <p className="mb-0">
                Students will enter free-form text as their answer. You can specify acceptable answers in the options.
              </p>
            </div>
          </div>
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
          <Card.Footer className="text-center bg-light">
            <small className="text-success">
              <FontAwesomeIcon icon={faCheck} className="me-1" /> Image uploaded
            </small>
          </Card.Footer>
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
          <Card.Footer className="text-center bg-light">
            <small className="text-success">
              <FontAwesomeIcon icon={faCheck} className="me-1" /> Audio uploaded
            </small>
          </Card.Footer>
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
          <Card.Footer className="text-center bg-light">
            <small className="text-success">
              <FontAwesomeIcon icon={faCheck} className="me-1" /> Video uploaded
            </small>
          </Card.Footer>
        </Card>
      );
    }

    return null;
  };

  // Determine if options display settings should be shown
  const showOptionsSettings = ['multiple', 'single'].includes(formData.type) && formData.options.length > 0;

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
              <Form.Label className="text-danger">({formData.type} Question)</Form.Label>
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
                      <FontAwesomeIcon icon={faImage} className="me-1" /> Image
                    </Button>
                    <Button
                      variant={formData.media.type === 'audio' ? 'primary' : 'outline-primary'}
                      onClick={() => handleMediaTypeSelect('audio')}
                    >
                      <FontAwesomeIcon icon={faMusic} className="me-1" /> Audio
                    </Button>
                    <Button
                      variant={formData.media.type === 'video' ? 'primary' : 'outline-primary'}
                      onClick={() => handleMediaTypeSelect('video')}
                    >
                      <FontAwesomeIcon icon={faVideo} className="me-1" /> Video
                    </Button>
                  </ButtonGroup>
                  
                  {formData.media.type && (
                    <>
                      <div className="d-flex mb-3">
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
                          className="me-2"
                        />
                        
                        <Button 
                          variant="success" 
                          onClick={handleMediaUpload}
                          disabled={!formData.media.file || isUploading}
                          className="d-flex align-items-center"
                        >
                          {isUploading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faUpload} className="me-2" /> Upload
                            </>
                          )}
                        </Button>
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
                            <FontAwesomeIcon icon={faTrash} className="me-1" /> Clear Media
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
            
            {/* Options display settings */}
            {showOptionsSettings && (
              <Row className="mt-4 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Sort Options</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        name="sort"
                        id="sort-alpha"
                        label="Alphabetical"
                        checked={formData.sort === "alphabetical"}
                        onChange={() => setFormData({...formData, sort: 'alphabetical'})}
                        inline
                      />
                      <Form.Check
                        type="radio"
                        name="sort"
                        id="sort-custom"
                        label="Custom Order"
                        checked={formData.sort === "custom"}
                        onChange={() => setFormData({...formData, sort: 'custom'})}
                        inline
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Display Layout</Form.Label>
                    <div>
                      {formData.type === 'multiple' ? (
                        <Form.Check
                          type="radio"
                          name="layout"
                          id="layout-checkboxes"
                          label="Checkboxes"
                          checked={formData.layout === "checkboxes"}
                          onChange={() => setFormData({...formData, layout: 'checkboxes'})}
                          inline
                        />
                      ) : (
                        <Form.Check
                          type="radio"
                          name="layout"
                          id="layout-radio"
                          label="Radio Buttons"
                          checked={formData.layout === "radio_buttons"}
                          onChange={() => setFormData({...formData, layout: 'radio_buttons'})}
                          inline
                        />
                      )}
                      <Form.Check
                        type="radio"
                        name="layout"
                        id="layout-dropdown"
                        label="Dropdown"
                        checked={formData.layout === "dropdown"}
                        onChange={() => setFormData({...formData, layout: 'dropdown'})}
                        inline
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            )}
            
            <div className="d-flex justify-content-end mt-4"></div>
              <Button variant="secondary" onClick={onClose} className="me-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Save Changes
                  </>
                )}
              </Button>
            
          </Form>
        </Modal.Body>
      </Modal>
      
      <CreateLoading isVisible={isSubmitting} />
    </>
  );
};

export default EditQuestionModal;