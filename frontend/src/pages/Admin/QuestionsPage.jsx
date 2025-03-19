import React, { useEffect, useState } from 'react'
import NavBar from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
import AddQuestion from '../../components/Admin/AddQuestion'
import EditQuestionModal from '../../components/Admin/EditQuestionModal'
import { useParams } from 'react-router-dom'
import { getQuestionsByQuizzId, deleteQuestion } from '../../api/questionApi' 
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const QuestionsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [quizzInfo, setQuizzInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { quizzId } = useParams();
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };
  
  // Handle sidebar toggle
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar")
    const closeBtn = document.querySelector("#btn")

    const menuBtnChange = () => {
      if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right")
      } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu")
      }
    }

    const handleClick = () => {
      sidebar.classList.toggle("open")
      menuBtnChange()
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", handleClick)
    }

    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener("click", handleClick)
      }
    }
  }, []);

  // Fetch questions and quiz info
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch questions
        const questionsData = await getQuestionsByQuizzId(quizzId);
        setQuestions(questionsData);
        
        // Optionally fetch quiz info if needed
        // const quizData = await getQuizzById(quizzId);
        // setQuizzInfo(quizData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [quizzId]);

  // Handle question deletion
  const handleDelete = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      
      // Update questions list after deletion
      setQuestions(questions.filter(q => q._id !== questionId));
      
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Handle edit button click
  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setShowEditModal(true);
  };

  // Handle question update
  const handleQuestionUpdate = (updatedQuestion) => {
    setQuestions(questions.map(q => 
      q._id === updatedQuestion._id ? updatedQuestion : q
    ));
  };

  // Handle add questions
  const handleAddQuestions = (newQuestions) => {
    if (Array.isArray(newQuestions)) {
      setQuestions([...questions, ...newQuestions]);
      toast.success(`${newQuestions.length} questions added successfully`);
    } else {
      setQuestions([...questions, newQuestions]);
      toast.success("Question added successfully");
    }
    setShowAddModal(false);
  };

  // Get question type display text
  const getQuestionTypeDisplay = (type) => {
    const types = {
      'multiple': 'Multiple Choice',
      'single': 'Single Choice',
      'boolean': 'True/False',
      'text': 'Text Response',
      'number': 'Number Response'
    };
    return types[type] || type;
  };

  return (
    <div className="wrapper">
      <div className='sidebar'>
        <NavBar />
      </div>
      <div className='home-section'>
          <NavBarTop />
          <div className="container-fluid mt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
            <button onClick={() => navigate(-1)}><BiArrowBack /></button>

              <h3>
                Questions 
                {quizzInfo && <span className="text-muted ms-2">for {quizzInfo.title}</span>}
                {questions.length > 0 && 
                  <span className="badge bg-primary ms-2">{questions.length}</span>
                }
              </h3>
              <button 
                className="btn btn-success" 
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-patch-plus-fill me-2"></i>
                Add Questions
              </button>
            </div>

            {isLoading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {questions.length === 0 ? (
                  <div className="alert alert-info text-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    No questions yet. Click the "Add Questions" button to create some!
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover border">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" width="50">#</th>
                          <th scope="col">Question Text</th>
                          <th scope="col" width="150">Type</th>
                          <th scope="col" width="100">Points</th>
                          <th scope="col" width="120">Created</th>
                          <th scope="col" width="120">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((question, index) => (
                          <tr key={question._id}>
                            <th scope="row" className="align-middle">{index + 1}</th>
                            <td className="align-middle">
                              {question.text}
                              {question.description && (
                                <small className="d-block text-muted">
                                  {question.description.length > 50 
                                    ? `${question.description.substring(0, 50)}...` 
                                    : question.description
                                  }
                                </small>
                              )}
                            </td>
                            <td className="align-middle">
                              <span className={`badge ${
                                question.type === 'multiple' ? 'bg-primary' :
                                question.type === 'single' ? 'bg-success' :
                                question.type === 'boolean' ? 'bg-warning text-dark' :
                                question.type === 'text' ? 'bg-info' :
                                'bg-secondary'
                              }`}>
                                {getQuestionTypeDisplay(question.type)}
                              </span>
                            </td>
                            <td className="align-middle text-center">
                              <span className="badge bg-light text-dark">
                                {question.points || 1}
                              </span>
                            </td>
                            <td className="align-middle">{formatDate(question.createdAt)}</td>
                            <td className="align-middle">
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary" 
                                  onClick={() => handleEdit(question)}
                                >
                                  <i className="bi bi-pencil-fill"></i>
                                </button>
                                <ConfirmDialog
                                  title="Confirm Deletion"
                                  text="Are you sure you want to delete this question? This action cannot be undone."
                                  confirmButtonText="Delete"
                                  onConfirm={() => handleDelete(question._id)}
                                  buttonClass="btn btn-outline-danger btn-sm"
                                  buttonIcon="bi bi-trash"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Add Question Modal */}
        <AddQuestion 
          show={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          quizId={quizzId}
          onSave={handleAddQuestions}
        />
        
        {/* Edit Question Modal */}
        {selectedQuestion && (
          <EditQuestionModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            question={selectedQuestion}
            onUpdate={handleQuestionUpdate}
          />
        )}
    </div>
  );
};

export default QuestionsPage;