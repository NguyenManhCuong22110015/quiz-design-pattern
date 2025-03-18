import { useEffect, useState } from 'react'
import NavBarLeft from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
import { createQuiz, getQuizzesByUserId } from '../../api/quizzApi'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { Link } from 'react-router-dom'
import AddQuizzModal from '../../components/Admin/AddQuizModal'
import { showSuccess, showError } from "../../components/common/Notification";

const QuizzPage = () => {

  const [quizzes , setQuizzes] = useState([])
  const userId = JSON.parse(localStorage.getItem('user')).id || 1
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
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


  useEffect(() => {
    
    const fetchQuizzes = async () => {
      const res = await getQuizzesByUserId(userId);
      console.log(res)

      setQuizzes(res)
    }
    fetchQuizzes()
  }
  , [])
  const handleDelete = () => {
    alert('Deleted')
  };
  return (
    <>
      <div className='sidebar'>
        <NavBarLeft />
      </div>
      <div className='home-section mt-5'>
        <NavBarTop />
        <div className="container-fluid">
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
        <th scope="col" width="120" className="text-center">Created at</th>
        <th scope="col" width="120" className="text-center">Updated</th>
        <th scope="col" width="160" className="text-center">Actions</th>
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
              <span className="badge bg-light text-dark">
                {formatDate(quiz.createAt)}
              </span>
            </td>
            <td className="text-center align-middle">
              <span className="badge bg-secondary text-white">
                {getTimeAgo(quiz.updatedAt)}
              </span>
            </td>
            <td className="text-center align-middle">
              <div className="btn-group" role="group">
                <Link 
                  to={`/admin/quizz/${quiz._id}`} 
                  className="btn btn-outline-primary btn-sm me-2"
                >
                  <i className="bi bi-pencil-square me-1"></i> Edit
                </Link>
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
    </>
  )
}

export default QuizzPage