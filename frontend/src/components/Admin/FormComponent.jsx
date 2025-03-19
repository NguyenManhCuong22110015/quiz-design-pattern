import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faQuestionCircle, 
  faGripVertical, 
  faMinusCircle, 
  faPlusCircle, 
  faSave, 
  faTimes, 
  faCheck,
  faImage,
  faMusic,
  faVideo,
  faUpload,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Form from "react-bootstrap/Form";
import { uploadImage, uploadMedia, uploadVideo,uploadAudio } from "../../api/mediaApi"; 
import { showError, showSuccess } from "../common/Notification";
import CreateLoading from "../common/CreateLoading";

const FormComponent = ({ show, onClose, questionType, quantity, quizId, onSave }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize questions based on selected type and quantity with new options structure
  useEffect(() => {
    if (questionType) {
      const newQuestions = Array.from({ length: quantity }, (_, index) => {
        // Create base options with isCorrect property
        let initialOptions = [];
        
        if (questionType.fixedOptions) {
          // Fixed options like True/False
          initialOptions = questionType.fixedOptions.map((opt, i) => ({
            option: opt,
            isCorrect: i === 0 // First option is correct by default
          }));
        } else if (questionType.hasOptions) {
          // Regular options with first one correct by default
          initialOptions = [
            { option: "Option 1", isCorrect: true },
            { option: "Option 2", isCorrect: false },
            { option: "Option 3", isCorrect: false }
          ];
        }
        
        return {
          id: `q_${Date.now()}_${index}`,
          question: `Question #${index + 1}`,
          type: questionType.formType,
          required: true,
          description: "",
          options: initialOptions,
          points: 1,
          time: 30, 
          sort: "alphabetical",
          layout: questionType.multipleCorrect ? "checkboxes" : "radio_buttons",
          mediaType: null,
          mediaUrl: null,
          mediaFile: null,
          mediaPreview: null,
          isUploading: false
        };
      });
      
      setQuestions(newQuestions);
    }
  }, [questionType, quantity]);

  // Add a new option to a question
  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    const optionCount = newQuestions[qIndex].options.length + 1;
    newQuestions[qIndex].options.push({
      option: `Option ${optionCount}`,
      isCorrect: false
    });
    setQuestions(newQuestions);
  };

  // Remove an option from a question
  const handleRemoveOption = (qIndex, index) => {
    const newQuestions = [...questions];
    // Don't allow removing if there are fewer than 2 options
    if (newQuestions[qIndex].options.length > 2) {
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    } else {
      alert("A question must have at least 2 options");
    }
  };

  // Handle change of option text
  const handleOptionChange = (qIndex, index, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[index].option = value;
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerToggle = (qIndex, index) => {
    const newQuestions = [...questions];
    
    if (questionType.multipleCorrect) {
      newQuestions[qIndex].options[index].isCorrect = !newQuestions[qIndex].options[index].isCorrect;
    } else {
      newQuestions[qIndex].options.forEach((opt, i) => {
        opt.isCorrect = (i === index);
      });
    }
    
    setQuestions(newQuestions);
  };

  const handleMediaTypeSelect = (qIndex, mediaType) => {
    const newQuestions = [...questions];
    
    if (newQuestions[qIndex].mediaType === mediaType) {
      newQuestions[qIndex].mediaType = null;
    } else {
      newQuestions[qIndex].mediaType = mediaType;
      newQuestions[qIndex].mediaUrl = null;
      newQuestions[qIndex].mediaFile = null;
      newQuestions[qIndex].mediaPreview = null;
    }
    
    setQuestions(newQuestions);
  };
  
  const handleMediaFileChange = (qIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    
    const isValid = validateMediaFile(file, question.mediaType);
    if (!isValid) {
      alert(`Please select a valid ${question.mediaType} file.`);
      return;
    }
    
    // Store the file and create a preview URL
    question.mediaFile = file;
    question.mediaPreview = URL.createObjectURL(file);
    
    setQuestions(newQuestions);
  };
  
  const validateMediaFile = (file, mediaType) => {
    if (!file || !mediaType) return false;
    
    const fileType = file.type.split('/')[0];
    
    switch (mediaType) {
      case 'image':
        return fileType === 'image';
      case 'audio':
        return fileType === 'audio';
      case 'video':
        return fileType === 'video';
      default:
        return false;
    }
  };
  
  // Handle media upload
  const handleMediaUpload = async (qIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    
    if (!question.mediaFile) return;
    
    try {
      question.isUploading = true;
      setQuestions([...newQuestions]);
      
      
     
      
      let response;
      if (question.mediaType === 'image') {
        const formData = new FormData();
        formData.append('image', question.mediaFile);
        response = await uploadImage(formData);
        if (response.imageUrl)
        {
          showSuccess("Image uploaded successfully");
        }
        question.mediaUrl = response.imageUrl;
      } 
      else if (question.mediaType === 'audio') {
        const formData = new FormData();
        formData.append('audio', question.mediaFile);
        response= await uploadAudio(formData);
        if (response.url)
          {
            showSuccess("Image uploaded successfully");
          }
        question.mediaUrl = response.url;
      } 
      else if (question.mediaType === 'video') {
        const formData = new FormData();
        formData.append('video', question.mediaFile);
        response= await uploadVideo(formData);
        if (response.url)
          {
            showSuccess("Image uploaded successfully");
          }
        question.mediaUrl = response.url;
        
      }
      
      console.log(`${question.mediaType} uploaded:`, question.mediaUrl);
      
    } catch (error) {
      console.error(`Error uploading ${question.mediaType}:`, error);
      showError(`Failed to upload ${question.mediaType}. Please try again.`);
    } finally {
      question.isUploading = false;
      setQuestions([...newQuestions]);
    }
  };
  
  // Handle clearing media
  const handleClearMedia = (qIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    
    // Free up the object URL to prevent memory leaks
    if (question.mediaPreview) {
      URL.revokeObjectURL(question.mediaPreview);
    }
    
    // Reset media properties
    question.mediaFile = null;
    question.mediaPreview = null;
    question.mediaUrl = null;
    
    setQuestions(newQuestions);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate all questions
      const invalidQuestions = questions.filter(q => {
        // Check for empty question text
        if (!q.question.trim()) return true;
        
        // For questions with options, check if at least one correct answer
        if (questionType.hasOptions) {
          const hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
          return !hasCorrectAnswer;
        }
        
        return false;
      });
      
      if (invalidQuestions.length > 0) {
        alert("Please ensure all questions have content and at least one correct answer selected");
        setIsSubmitting(false);
        return;
      }
      
      // Format questions for API submission
      const formattedQuestions = questions.map(q => ({
        quizId,
        question: q.question,
        type: q.type,
        required: q.required,
        description: q.description,
        options: q.options, // Using the new structure with option and isCorrect
        points: q.points,
        time: q.time,
        sort: q.sort,
        layout: q.layout,
        // Include media if present
        mediaType: q.mediaType || null,
        mediaUrl: q.mediaUrl || null
      }));
      
      // Here you would typically send formattedQuestions to your API
      console.log("Submitting questions:", formattedQuestions);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On success
      onSave(formattedQuestions);
      
    } catch (error) {
      console.error("Error submitting questions:", error);
      alert("Failed to save questions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render media section for a question
  const renderMediaSection = (question, index) => {
    return (
      <Form.Group className="mb-4">
        <Form.Label>Add Media</Form.Label>
        
        <div className="d-flex flex-wrap gap-2 mb-3">
          <Button 
            variant={question.mediaType === 'image' ? 'primary' : 'outline-secondary'} 
            onClick={() => handleMediaTypeSelect(index, 'image')}
            className="d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faImage} className="me-2" /> Image
          </Button>
          
          <Button 
            variant={question.mediaType === 'audio' ? 'primary' : 'outline-secondary'} 
            onClick={() => handleMediaTypeSelect(index, 'audio')}
            className="d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faMusic} className="me-2" /> Audio
          </Button>
          
          <Button 
            variant={question.mediaType === 'video' ? 'primary' : 'outline-secondary'} 
            onClick={() => handleMediaTypeSelect(index, 'video')}
            className="d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faVideo} className="me-2" /> Video
          </Button>
        </div>
        
        {question.mediaType && (
          <div>
            <div className="d-flex align-items-center mb-3">
              <Form.Control
                type="file"
                accept={
                  question.mediaType === 'image' ? 'image/*' :
                  question.mediaType === 'audio' ? 'audio/*' :
                  'video/*'
                }
                onChange={(e) => handleMediaFileChange(index, e)}
                className="me-2"
              />
              
              <Button 
                variant="success" 
                onClick={() => handleMediaUpload(index)}
                disabled={!question.mediaFile || question.isUploading}
                className="d-flex align-items-center"
              >
                {question.isUploading ? (
                  <>
                   <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                   Uploading...
                    <CreateLoading isVisible={questions.isUploading} />
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} className="me-2" /> Upload
                    
                  </>
                )}
              </Button>
              
              {(question.mediaPreview || question.mediaUrl) && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleClearMedia(index)}
                  className="ms-2 d-flex align-items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" /> Clear
                </Button>
              )}
            </div>
            
            {question.mediaPreview && (
              <div className="border p-3 rounded mb-3 bg-light">
                {question.mediaType === 'image' && (
                  <img 
                    src={question.mediaPreview} 
                    alt="Preview" 
                    style={{ maxHeight: '200px', maxWidth: '100%' }} 
                    className="d-block mx-auto"
                  />
                )}
                
                {question.mediaType === 'audio' && (
                  <audio 
                    controls 
                    src={question.mediaPreview} 
                    className="w-100"
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}
                
                {question.mediaType === 'video' && (
                  <video 
                    controls 
                    src={question.mediaPreview} 
                    style={{ maxHeight: '200px', maxWidth: '100%' }} 
                    className="d-block mx-auto"
                  >
                    Your browser does not support the video element.
                  </video>
                )}
                
                <div className="mt-2 text-center">
                  {question.mediaUrl ? (
                    <span className="text-success">
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Media uploaded successfully
                    </span>
                  ) : (
                    <span className="text-warning">
                      <FontAwesomeIcon icon={faQuestionCircle} className="me-1" />
                      Click "Upload" to save this media
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
      </Form.Group>
    );
  };

  return (
    <Modal show={show} onHide={onClose} size="fullscreen" backdrop="static">
      <Modal.Header>
        <Modal.Title>
          <h3 className="mb-0">Creating {quantity} {questionType.title} Question{quantity > 1 ? 's' : ''}</h3>
        </Modal.Title>
        <Button variant="link" className="ms-auto" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </Button>
      </Modal.Header>
      
      <Modal.Body>
        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab(k)} 
          id="question-tabs" 
          className="mb-4"
        >
          {questions.map((question, index) => (
            <Tab 
              eventKey={(index + 1).toString()} 
              title={`Q${index + 1}`} 
              key={question.id}
            >
              <div className="container py-3">
                <Form.Group className="mb-4">
                  <Form.Label>Question Text <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={question.question} 
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} 
                    placeholder="Enter your question" 
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Description <FontAwesomeIcon icon={faQuestionCircle} /></Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    value={question.description} 
                    onChange={(e) => handleQuestionChange(index, 'description', e.target.value)} 
                    placeholder="Optional additional information for the question"
                  />
                </Form.Group>

                {/* Media section */}
                {renderMediaSection(question, index)}

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-4">
                      <Form.Label>Points</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1" 
                        value={question.points} 
                        onChange={(e) => handleQuestionChange(index, 'points', Math.max(1, parseInt(e.target.value) || 1))} 
                      />
                      <Form.Text className="text-muted">
                        Points awarded for a correct answer
                      </Form.Text>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-4">
                      <Form.Label>Time Limit (seconds)</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="5" 
                        value={question.time} 
                        onChange={(e) => handleQuestionChange(index, 'time', Math.max(5, parseInt(e.target.value) || 5))} 
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
                    id={`required-${index}`}
                    label="This question is required"
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                  />
                </Form.Group>

                {questionType.hasOptions && (
                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="mb-0">Answer Options <span className="text-danger">*</span></Form.Label>
                      {!questionType.fixedOptions && (
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleAddOption(index)}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} className="me-1" /> Add Option
                        </Button>
                      )}
                    </div>
                    
                    <div className="border rounded p-3 bg-light">
                      {question.options.map((optionObj, optionIndex) => (
                        <div className="d-flex align-items-center mb-3" key={`${question.id}-opt-${optionIndex}`}>
                          <div className="me-2">
                            {questionType.multipleCorrect ? (
                              <Form.Check
                                type="checkbox"
                                checked={optionObj.isCorrect}
                                onChange={() => handleCorrectAnswerToggle(index, optionIndex)}
                                label=""
                              />
                            ) : (
                              <Form.Check
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={optionObj.isCorrect}
                                onChange={() => handleCorrectAnswerToggle(index, optionIndex)}
                                label=""
                              />
                            )}
                          </div>
                          
                          <div className="me-2">
                            <FontAwesomeIcon icon={faGripVertical} className="text-muted" />
                          </div>
                          
                          <Form.Control
                            type="text"
                            value={optionObj.option}
                            onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                            readOnly={questionType.fixedOptions !== undefined}
                          />
                          
                          {!questionType.fixedOptions && (
                            <Button
                              variant="link"
                              className="text-danger"
                              disabled={question.options.length <= 2}
                              onClick={() => handleRemoveOption(index, optionIndex)}
                            >
                              <FontAwesomeIcon icon={faMinusCircle} />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <div className="mt-2 text-center text-muted small">
                        {questionType.multipleCorrect 
                          ? "✓ Select all correct answers" 
                          : "○ Select the single correct answer"}
                      </div>
                    </div>
                  </Form.Group>
                )}
                
                {!questionType.hasOptions && (
                  <div className="alert alert-info">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faQuestionCircle} className="me-2" size="lg" />
                      <div>
                        <h5 className="mb-1">Response Type: {questionType.title}</h5>
                        <p className="mb-0">
                          {questionType.description} You'll need to evaluate the answers manually.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {questionType.hasOptions && (
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label>Sort Options</Form.Label>
                        <div>
                          <Form.Check
                            type="radio"
                            name={`sort-${index}`}
                            id={`sort-alpha-${index}`}
                            label="Alphabetical"
                            checked={question.sort === "alphabetical"}
                            onChange={() => handleQuestionChange(index, 'sort', 'alphabetical')}
                            inline
                          />
                          <Form.Check
                            type="radio"
                            name={`sort-${index}`}
                            id={`sort-custom-${index}`}
                            label="Custom Order"
                            checked={question.sort === "custom"}
                            onChange={() => handleQuestionChange(index, 'sort', 'custom')}
                            inline
                          />
                        </div>
                      </Form.Group>
                    </div>
                    
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label>Display Layout</Form.Label>
                        <div>
                          {questionType.multipleCorrect ? (
                            <Form.Check
                              type="radio"
                              name={`layout-${index}`}
                              id={`layout-checkboxes-${index}`}
                              label="Checkboxes"
                              checked={question.layout === "checkboxes"}
                              onChange={() => handleQuestionChange(index, 'layout', 'checkboxes')}
                              inline
                            />
                          ) : (
                            <Form.Check
                              type="radio"
                              name={`layout-${index}`}
                              id={`layout-radio-${index}`}
                              label="Radio Buttons"
                              checked={question.layout === "radio_buttons"}
                              onChange={() => handleQuestionChange(index, 'layout', 'radio_buttons')}
                              inline
                            />
                          )}
                          <Form.Check
                            type="radio"
                            name={`layout-${index}`}
                            id={`layout-dropdown-${index}`}
                            label="Dropdown"
                            checked={question.layout === "dropdown"}
                            onChange={() => handleQuestionChange(index, 'layout', 'dropdown')}
                            inline
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                )}
              </div>
            </Tab>
          ))}
        </Tabs>
      </Modal.Body>
      
      <Modal.Footer className="justify-content-between">
        <div>
          <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
        <div className="d-flex align-items-center">
          <div className="text-muted me-3">
            Question {activeTab} of {questions.length}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save All Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
     
    </Modal>
  );
};

export default FormComponent;