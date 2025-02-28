import { useEffect, useState } from 'react'
import NavBarLeft from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
import { getQuizzesByUserId } from '../../api/quizzApi'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { Link } from 'react-router-dom'
const Admin = () => {

  const [quizzes , setQuizzes] = useState([])
  const userId = localStorage.getItem('userId') || 1
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
            <button className="btn btn-success">
              <i className="bi bi-patch-plus-fill me-2"></i>
              Add Quizz
            </button> 
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Created at</th>
                  <th scope="col">Updated</th>
                  <th scope="col" width="100"></th>
                </tr>
              </thead>
              <tbody>
              {quizzes.map((quiz, index) => (
                <tr key={quiz._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{quiz.title}</td>
                  <td>{quiz.description}</td>
                  <td>{formatDate(quiz.createAt)}</td>
                  <td>{getTimeAgo(quiz.updatedAt)}</td>
                  <td>
                  <Link 
                        to={`/admin/quizz/${quiz._id}`} 
                        className="btn btn-outline-primary btn-sm"
                      >
                        Edit
                  </Link>
                  </td>
                  <td>
                  <ConfirmDialog
                    title="Bạn có chắc chắn muốn xóa?"
                    text="Hành động này không thể hoàn tác!"
                    confirmButtonText="Xóa ngay"
                    onConfirm={handleDelete}/>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default Admin