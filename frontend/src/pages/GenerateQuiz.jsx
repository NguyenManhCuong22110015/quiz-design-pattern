import React, { useState, useEffect, useRef } from 'react';
import "../styles/GenerateQuiz.css";
import { generateQuizzes, generateQuizzesByPDF, getAllQuizzes, saveQuestionsToQuiz } from '../api/quizzApi';
import QuestionPreviewCard from '../components/Questions/QuestionPreviewCard';
import { Container, Row, Col, Button, Spinner, Modal, Form, Alert, ListGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showSuccess } from '../components/common/Notification';
import CreateLoading from '../components/common/CreateLoading';
import { FaFilePdf } from "react-icons/fa6";

const GenerateQuiz = () => {
  // State để lưu giá trị của các trường
  const [subject, setSubject] = useState("");
  const [questionType, setQuestionType] = useState("True / False");
  const [questionCount, setQuestionCount] = useState("1 questions");
  const [difficulty, setDifficulty] = useState("Dễ");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [pdfQuestions, setPdfQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [newQuizName, setNewQuizName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [createNewQuiz, setCreateNewQuiz] = useState(false);
  
  // Reset expanded card when question changes
  useEffect(() => {
    setExpandedCard(null);
  }, [allQuestions]);
  
  // Kết hợp tất cả câu hỏi khi các state thay đổi
  useEffect(() => {
    // Merge questions from both sources
    const combined = [
      ...generatedQuestions.map(q => ({ ...q, source: 'ai' })),
      ...pdfQuestions.map(q => ({ ...q, source: 'pdf' }))
    ];
    setAllQuestions(combined);
  }, [generatedQuestions, pdfQuestions]);
  
  // Fetch available quizzes when modal opens
  const fetchAvailableQuizzes = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const quizzes = await getAllQuizzes(userId);
      setAvailableQuizzes(quizzes);
      if (quizzes.length > 0) {
        setSelectedQuizId(quizzes[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      toast.error("Không thể tải danh sách quiz");
    }
  };
  
  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError("Vui lòng nhập chủ đề để tạo quiz");
      return;
    }
    
    setGeneratedQuestions([]);
    setIsLoading(true);
    setError(null);
    
    const prompt = `Tạo bài quiz với các chủ đề về ${subject} thuộc loại ${questionType}. Với số lượng ${questionCount} và độ khó ở mức ${difficulty}`;
    
    try {
      console.log("Sending prompt:", prompt);
      const response = await generateQuizzes(prompt);
      console.log("Received response:", response);
      
      // Kiểm tra nếu response là array
      if (Array.isArray(response)) {
        setGeneratedQuestions(response);
        console.log(`Generated ${response.length} questions`);
      } 
      // Nếu là string, thử parse JSON
      else if (typeof response === 'string') {
        try {
          // Tìm và trích xuất mảng JSON từ kết quả
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedQuestions = JSON.parse(jsonMatch[0]);
            setGeneratedQuestions(parsedQuestions);
            console.log(`Parsed ${parsedQuestions.length} questions`);
          } else {
            setError("Không thể tìm thấy mảng câu hỏi trong kết quả");
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          setError("Lỗi khi xử lý kết quả từ AI");
        }
      }
      // Nếu là object với mảng questions
      else if (response && response.questions && Array.isArray(response.questions)) {
        setGeneratedQuestions(response.questions);
        console.log(`Found ${response.questions.length} questions in response object`);
      }
      // Trường hợp không xác định được dạng dữ liệu
      else {
        console.error("Unknown response format:", response);
        setError("Định dạng phản hồi không hợp lệ");
      }
    } catch (error) {
      console.error("API Error:", error);
      setError("Đã xảy ra lỗi khi tạo quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionUpdate = (index, updatedQuestion) => {
    const newQuestions = [...allQuestions];
    newQuestions[index] = updatedQuestion;
    
    // Update the appropriate source based on the question's source
    if (updatedQuestion.source === 'pdf') {
      const pdfIndex = pdfQuestions.findIndex((q, i) => i === index - generatedQuestions.length);
      if (pdfIndex !== -1) {
        const newPdfQuestions = [...pdfQuestions];
        newPdfQuestions[pdfIndex] = updatedQuestion;
        setPdfQuestions(newPdfQuestions);
      }
    } else {
      const aiIndex = generatedQuestions.findIndex((q, i) => i === index);
      if (aiIndex !== -1) {
        const newGeneratedQuestions = [...generatedQuestions];
        newGeneratedQuestions[aiIndex] = updatedQuestion;
        setGeneratedQuestions(newGeneratedQuestions);
      }
    }
    
    setAllQuestions(newQuestions);
  };
  
  const handleDeleteQuestion = (index) => {
    // Identify which array the question is from
    const question = allQuestions[index];
    
    if (question.source === 'pdf') {
      // Find the index in the pdfQuestions array
      const pdfIndex = pdfQuestions.findIndex((q, i) => 
        i === index - generatedQuestions.length
      );
      
      if (pdfIndex !== -1) {
        const newPdfQuestions = [...pdfQuestions];
        newPdfQuestions.splice(pdfIndex, 1);
        setPdfQuestions(newPdfQuestions);
      }
    } else {
      // It's from generatedQuestions
      const aiIndex = index < generatedQuestions.length ? index : -1;
      
      if (aiIndex !== -1) {
        const newGeneratedQuestions = [...generatedQuestions];
        newGeneratedQuestions.splice(aiIndex, 1);
        setGeneratedQuestions(newGeneratedQuestions);
      }
    }
    
    // Update allQuestions
    const newAllQuestions = [...allQuestions];
    newAllQuestions.splice(index, 1);
    setAllQuestions(newAllQuestions);
    
    // Reset expanded card if it was the deleted one
    if (expandedCard === index) {
      setExpandedCard(null);
    } else if (expandedCard !== null && expandedCard > index) {
      // Adjust index of expanded card if it was after the deleted one
      setExpandedCard(expandedCard - 1);
    }
    
    toast.info("Đã xóa câu hỏi");
  };

  const handleShowSaveModal = () => {
    if (allQuestions.length === 0) {
      toast.warning("Không có câu hỏi nào để lưu");
      return;
    }
    
    fetchAvailableQuizzes();
    setShowSaveModal(true);
  };
  
  const handleSaveQuiz = async () => {
    if (allQuestions.length === 0) {
      toast.warning("Không có câu hỏi nào để lưu");
      return;
    }
    
    setIsSaving(true);
    
    try {
      let quizId = selectedQuizId;
      
      alert("quizId: " + quizId);

      await saveQuestionsToQuiz(quizId, allQuestions);
      
      showSuccess("Đã lưu câu hỏi vào quiz thành công");
      setShowSaveModal(false);
      
      // Optional: Clear all questions after saving
      // setGeneratedQuestions([]);
      // setPdfQuestions([]);
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast.error("Không thể lưu quiz. Vui lòng thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleCardExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleShowUploadModal = (e) => {
    e.preventDefault();
    setShowUploadModal(true);
    setPdfFile(null);
    setUploadError(null);
  };
  
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError(null);
    
    if (!file) {
      setPdfFile(null);
      return;
    }
    
    // Kiểm tra loại file
    if (file.type !== 'application/pdf') {
      setUploadError('Chỉ chấp nhận file PDF.');
      setPdfFile(null);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    // Kiểm tra kích thước file (60MB = 60 * 1024 * 1024 bytes)
    if (file.size > 60 * 1024 * 1024) {
      setUploadError('File quá lớn. Kích thước tối đa là 60MB.');
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    setPdfFile(file);
  };
  
  const handleUploadPdf = async () => {
    if (!pdfFile) {
      setUploadError('Vui lòng chọn file PDF.');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      
      // Gọi API để xử lý PDF
      const result = await generateQuizzesByPDF(formData);
      
      console.log('Upload result:', result);
      
      if (Array.isArray(result) && result.length > 0) {
        // Thêm trường source để đánh dấu nguồn câu hỏi
        const questionsWithSource = result.map(q => ({
          ...q,
          source: 'pdf'
        }));
        
        // Cập nhật state với câu hỏi từ PDF
        setPdfQuestions(questionsWithSource);
        
        // Đóng modal
        setShowUploadModal(false);
        
        // Thông báo thành công
        toast.success(`Đã tạo ${result.length} câu hỏi từ PDF!`);
      } else {
        // Xử lý khi không nhận được câu hỏi hợp lệ
        setUploadError('Không thể tạo câu hỏi từ PDF này. Vui lòng thử file khác.');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError('Đã xảy ra lỗi khi tải file. Vui lòng thử lại sau.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="generate-quiz">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="fixed-corner-icon">
        <a href="/" ><i className="fas fa-robot"></i></a>
        
      </div>
      <Container>
        <h1 className="text-center mb-4">A.I. Quiz Generator</h1>
        <p className="text-center mb-4">Type a subject to generate a quiz</p>
        
        <div className="search-bar mb-4">
          <input 
            type="text" 
            placeholder="Enter subject (e.g. World History, Biology, etc.)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-control form-control-lg"
          />
        </div>
        
        <div className="options mb-4">
          <Row>
            <Col md={4}>
              <select 
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="form-select"
              >
                <option>True / False</option>
                <option>Multiple choices</option>
                <option>Number response</option>
                <option>One answer</option>
                <option>Writing response</option>
              </select>
            </Col>
            <Col md={4}>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="form-select"
              >
                <option>1 questions</option>
                <option>2 questions</option>
                <option>4 questions</option>
                <option>8 questions</option>
                <option>16 questions</option>
                <option>20 questions</option>
                <option>30 questions</option>
              </select>
            </Col>
            <Col md={4}>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="form-select"
              >
                <option>Dễ</option>
                <option>Trung bình</option>
                <option>Khó</option>
              </select>
            </Col>
          </Row>
        </div>
        
        <div className="generate-button-container text-center mb-4">
            <Button 
              variant="danger" 
              size="lg" 
              className="generate-button"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Generating...
                  <CreateLoading/>
                </>
              ) : (
                <>
                  <i className="fas fa-bolt me-2"></i>
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}
        
        {/* Hiển thị câu hỏi được tạo từ AI */}
        {generatedQuestions.length > 0 && (
          <div className="generated-questions">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>AI Generated Questions ({generatedQuestions.length})</h2>
              <Button variant="success" onClick={handleShowSaveModal}>
                <i className="fas fa-save me-2"></i>
                Save Quiz
              </Button>
            </div>
            
            <Row className="questions-grid">
              <AnimatePresence>
                {generatedQuestions.map((question, index) => (
                  <Col xs={12} md={expandedCard === index ? 12 : 4} key={index} 
                       className={`mb-4 ${expandedCard !== null && expandedCard !== index ? 'inactive-card' : ''}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      <QuestionPreviewCard
                        question={question}
                        index={index}
                        isExpanded={expandedCard === index}
                        onToggleExpand={() => toggleCardExpand(index)}
                        onUpdate={(updatedQuestion) => handleQuestionUpdate(index, updatedQuestion)}
                        onDelete={() => handleDeleteQuestion(index)}
                      />
                    </motion.div>
                  </Col>
                ))}
              </AnimatePresence>
            </Row>
          </div>
        )}
        
        {/* Hiển thị câu hỏi được tạo từ PDF */}
        {pdfQuestions.length > 0 && (
          <div className="pdf-questions mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Questions from PDF ({pdfQuestions.length})</h2>
              {generatedQuestions.length === 0 && (
                <Button variant="success" onClick={handleShowSaveModal}>
                  <i className="fas fa-save me-2"></i>
                  Save Quiz
                </Button>
              )}
            </div>
            
            <Row className="questions-grid">
              <AnimatePresence>
                {pdfQuestions.map((question, index) => (
                  <Col xs={12} md={expandedCard === (index + generatedQuestions.length) ? 12 : 4} key={index} 
                       className={`mb-4 ${expandedCard !== null && expandedCard !== (index + generatedQuestions.length) ? 'inactive-card' : ''}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      <QuestionPreviewCard
                        question={question}
                        index={index + generatedQuestions.length}
                        isExpanded={expandedCard === (index + generatedQuestions.length)}
                        onToggleExpand={() => toggleCardExpand(index + generatedQuestions.length)}
                        onUpdate={(updatedQuestion) => handleQuestionUpdate(index + generatedQuestions.length, updatedQuestion)}
                        onDelete={() => handleDeleteQuestion(index + generatedQuestions.length)}
                      />
                    </motion.div>
                  </Col>
                ))}
              </AnimatePresence>
            </Row>
          </div>
        )}
        
        {/* Upload PDF section */}
        <div className="upload-section mt-5 text-center">
          <p>
            <img src="https://placehold.co/20x20/png" alt="PDF icon" className="me-2"/>
            <a href="#" onClick={handleShowUploadModal}>
              Upload a PDF
              <span className="d-none d-md-inline"> and select questions generated by AI based on your content</span>
            </a>
          </p>
        </div>
      </Container>
      
      {/* Modal Upload PDF */}
      <Modal 
        show={showUploadModal} 
        onHide={handleCloseUploadModal}
        centered
        className="pdf-upload-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select PDF file</Form.Label>
              <Form.Control 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {uploadError && (
                <Alert variant="danger" className="mt-3">
                  {uploadError}
                </Alert>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUploadModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadPdf}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload me-2"></i>
                Upload
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal Save Quiz */}
      <Modal
        show={showSaveModal}
        onHide={() => setShowSaveModal(false)}
        centered
        className="save-quiz-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Save to Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="radio"
                id="existing-quiz"
                label="Add to existing quiz"
                checked={!createNewQuiz}
                onChange={() => setCreateNewQuiz(false)}
                className="mb-2"
              />
              
              {!createNewQuiz && (
                <div className="ps-4 mb-3">
                  <Form.Select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    disabled={availableQuizzes.length === 0}
                  >
                    {availableQuizzes.length === 0 ? (
                      <option>No quizzes available</option>
                    ) : (
                      availableQuizzes.map(quiz => (
                        <option key={quiz._id} value={quiz._id}>
                          {quiz.title}
                        </option>
                      ))
                    )}
                  </Form.Select>
                  
                  {availableQuizzes.length > 0 && selectedQuizId && (
                    <ListGroup className="mt-2">
                      {availableQuizzes
                        .find(q => q._id === selectedQuizId)
                        ?.questions?.slice(0, 3)
                        .map((q, i) => (
                          <ListGroup.Item key={i} className="small">
                            {q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question}
                          </ListGroup.Item>
                        ))}
                      {(availableQuizzes.find(q => q._id === selectedQuizId)?.questions?.length > 3) && (
                        <ListGroup.Item className="text-muted small">
                          ...and {availableQuizzes.find(q => q._id === selectedQuizId).questions.length - 3} more questions
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  )}
                </div>
              )}
            
            </Form.Group>
          </Form>
          
          <div className="questions-summary mt-4">
            <h6>Questions to save ({allQuestions.length}):</h6>
            <div className="small text-muted">
              {generatedQuestions.length > 0 && (
                <div>• {generatedQuestions.length} questions from AI generator</div>
              )}
              {pdfQuestions.length > 0 && (
                <div>• {pdfQuestions.length} questions from PDF</div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveQuiz}
            disabled={isSaving || (createNewQuiz && !newQuizName.trim()) || (!createNewQuiz && !selectedQuizId)}
          >
            {isSaving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Save
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {isLoading ? (
                <>
                 
                  <CreateLoading/>
                </>
              ) : (
                <>
                
                </>
              )}
    </div>
  );
};

export default GenerateQuiz;