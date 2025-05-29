import { useEffect, useState } from 'react'
import NavBarLeft from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
import { createQuiz, deleteQuiz, getQuizzesByUserId, updateQuiz, updateQuizStatus } from '../../api/quizzApi'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { Link } from 'react-router-dom'
import AddQuizzModal from '../../components/Admin/AddQuizModal'
import EditQuizModal from '../../components/Admin/EditQuizModal';
import { showSuccess, showError } from "../../components/common/Notification";
import { FcQuestions } from "react-icons/fc";
import CreateLoading from '../../components/common/CreateLoading'
import Swal from "sweetalert2";
import { Modal } from 'react-bootstrap'

const QuizzPage = () => {

  const [quizzes, setQuizzes] = useState([])
  const userId = JSON.parse(localStorage.getItem('user')).id || 1
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [showStateModal, setShowStateModal] = useState(false);

  const openStateModal = (quiz) => {
    setSelectedQuiz(quiz);
    setShowStateModal(true);
  };

  const closeStateModal = () => {
    setSelectedQuiz(null);
    setShowStateModal(false);
  };
  const handleOpenEditModal = (quiz) => {
    setSelectedQuiz(quiz);

    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    console.log('Selected quiz:', selectedQuiz);
    setSelectedQuiz(null);
  };
  const handleSaveData = async (data) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!userData || !userData.id) {
        console.error('User data not found or missing id');
        return;
      }

      data.createdBy = userData.id;

      const response = await createQuiz(data);

      console.log('Quiz created:', response.data);
      console.log('Dữ liệu đã lưu:', data);
      showSuccess('Quiz created successfully!');

    } catch (error) {
      console.error('Error parsing user data:', error);
      showError('Failed to create quiz!');
    }
  };
  const handleUpdateQuiz = async (quizId, formData) => {
    try {

      const response = await updateQuiz(quizId, formData);
      window.location.reload();
      showSuccess('Quiz updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      showError('Failed to update quiz!');
      throw error;
    }
  };
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
  }, [])
  const handleTogglePublish = async (quizId, newPublishedState) => {
    try {

      // Hiển thị xác nhận nếu unpublish
      if (!newPublishedState) {
        const confirmed = await Swal.fire({
          title: 'Unpublish this quiz?',
          text: "The quiz will no longer be accessible to participants",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, unpublish it!'
        });

        if (!confirmed.isConfirmed) {
          return;
        }
      }

      const updateData = {
        published: newPublishedState
      };

      // Gọi API update
      await updateQuiz(quizId, updateData);

      // Cập nhật state local để UI thay đổi ngay lập tức
      setQuizzes(prev =>
        prev.map(quiz =>
          quiz._id === quizId ? { ...quiz, published: newPublishedState } : quiz
        )
      );

      // Hiển thị thông báo thành công
      showSuccess(`Quiz ${newPublishedState ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('Error toggling publish state:', error);
      showError(`Failed to ${newPublishedState ? 'publish' : 'unpublish'} quiz`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateState = async () => {
    try {
      setIsLoading(true);

      // Gửi đúng format data mà backend expect
      const updatedQuiz = await updateQuizStatus(selectedQuiz._id, {
        action: selectedQuiz.status,
      });

      // Cập nhật state local
      setQuizzes(prev => prev.map(q => q._id === updatedQuiz._id ? updatedQuiz : q));

      showSuccess('Quiz state updated successfully!');
      closeStateModal();

      // Refresh lại data để đảm bảo đồng bộ
      const res = await getQuizzesByUserId(userId);
      setQuizzes(res);

    } catch (error) {
      console.error('Error updating quiz state:', error);
      showError('Failed to update quiz state');
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    setIsLoading(true);
    const fetchQuizzes = async () => {
      const res = await getQuizzesByUserId(userId);
      console.log(res)

      setQuizzes(res)
    }
    fetchQuizzes()
    setIsLoading(false);
  }
    , [])
  const handleDelete = async (id) => {
    try {
      await deleteQuiz(id);
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== id));
      showSuccess('Quiz deleted successfully!');
    }
    catch (error) {
      console.error('Error deleting quiz:', error);
      showError('Failed to delete quiz!');
    }

  };
  if (isLoading) {
    return <CreateLoading />
  }
  return (
    <>
      <div className='sidebar admin-layout'>
        <NavBarLeft />
      </div>
      <div className='home-section mt-5'>
        <NavBarTop />
        <div className="container-fluid admin-content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">Quizzes</h3>
            <button className="btn btn-success" onClick={handleOpenModal}>
              <i className="bi bi-patch-plus-fill me-2"></i>
              Add Quizz
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="text-center" width="60">#</th>
                  <th scope="col" width="200">Title</th>
                  <th scope="col">Description</th>

                  <th scope="col" width="120" className="text-center">Updated</th>
                  <th scope="col" width="160" className="text-center">Published</th>
                  <th scope="col" width="160" className="text-center">State</th>

                  <th scope="col" width="160" className="text-center">Actions</th>
                  <th scope="col" width="160" className="text-center">Questions</th>

                </tr>
              </thead>
              <tbody>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz, index) => (
                    <tr key={quiz._id}>
                      <th scope="row" className="text-center align-middle">{index + 1}</th>
                      <td className="fw-bold align-middle">{quiz.title}</td>
                      <td className="align-middle text-muted">
                        {quiz.description.length > 100 ?
                          `${quiz.description.substring(0, 100)}...` : quiz.description}
                      </td>

                      <td className="text-center align-middle">
                        <span className="badge bg-secondary text-white">
                          {getTimeAgo(quiz.updatedAt)}
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <span className={`badge ${quiz.published ? 'bg-success' : 'bg-secondary'} text-white`}>
                          <i className={`bi ${quiz.published ? 'bi-globe' : 'bi-file-earmark-lock'} me-1`}></i>
                          {quiz.published ? 'Live' : 'Draft'}
                        </span>
                      </td>

                      <td className="text-center align-middle">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => openStateModal(quiz)}
                        >
                          {quiz.status || 'draft'}
                        </button>
                      </td>
                      <td className="text-center align-middle">
                        <div className="btn-group" role="group">
                          <button
                            onClick={() => handleOpenEditModal(quiz)}
                            className="btn btn-outline-primary btn-sm me-2"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                          <ConfirmDialog
                            title="Bạn có chắc chắn muốn xóa?"
                            text="Hành động này không thể hoàn tác!"
                            confirmButtonText="Xóa ngay"
                            onConfirm={() => handleDelete(quiz._id)}
                            buttonClass="btn btn-outline-danger btn-sm"
                            buttonIcon="bi bi-trash"
                            buttonText="Delete"
                          />
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/admin/quizz/${quiz._id}`}
                          className="btn btn-outline-primary btn-sm me-2"
                        >
                          <i className="bi bi-patch-question-fill me-1"></i> Go
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox-fill me-2 fs-4"></i>
                      No quizzes available. Create one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddQuizzModal
        show={showModal}
        handleClose={handleCloseModal}
        onSave={handleSaveData}
      />
      <EditQuizModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        quiz={selectedQuiz}
        onUpdate={handleUpdateQuiz}
      />
      {showStateModal && selectedQuiz && (
        <Modal show={showStateModal} onHide={closeStateModal}>
          <Modal.Header closeButton>
            <Modal.Title>Update Quiz State</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label">Current Status: <strong>{selectedQuiz.status || 'draft'}</strong></label>
            </div>
            <select
              className="form-select"
              value={selectedQuiz.status || 'draft'}
              onChange={(e) => setSelectedQuiz({ ...selectedQuiz, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={closeStateModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdateState} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </Modal.Footer>
        </Modal>
      )}

    </>
  )
}

export default QuizzPage