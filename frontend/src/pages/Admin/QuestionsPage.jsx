import React, { useEffect,useState } from 'react'
import NavBar from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
import AddQuestion from '../../components/Admin/AddQuestion'
import { useParams } from 'react-router-dom'
import { getQuestionsByQuizzId } from '../../api/questionApi' 
const Questions = () => {
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => {
        setShowModal(true);
    };
    const [questions, setQuestions] = useState([])
    const quizzId = useParams().quizzId
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
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
        const getQuestions = async () => {
          const questions = await getQuestionsByQuizzId(quizzId)
          console.log(questions)
          setQuestions(questions)
        }
        getQuestions()
      }
      , [quizzId])


  return (
    <div className="wrapper">
      <div className='sidebar'>
        <NavBar />
      </div>
      <div className='home-section'>
          <NavBarTop />
          <div className="container-fluid mt-3">
            <div className="d-flex justify-content-between">
              <h3>Questions for </h3>
              <button className="btn btn-success me-3" onClick={handleOpenModal}>
                 <i className="bi bi-patch-plus-fill me-3"></i>
                Add a question
                </button> 

                {showModal && <AddQuestion show={showModal} onClose={() => setShowModal(false)} />}
            </div>
            <div className="table-responsive">
            <table className="table">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Text</th>
                  <th scope="col">Description</th>
                  <th scope="col">Created at</th>
                  <th scope="col">Updated</th>
                  <th scope="col" width="100"></th>
                </tr>
              </thead>
              <tbody>
              {questions.map((questions, index) => (
                <tr key={questions._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{questions.text}</td>
                  <td>{questions.type}</td>
                  <td>{formatDate(questions.createAt)}</td>
                 
                  <td>
                    <a className="btn btn-primary btn-sm me-2 " href={`/admin/question/${questions._id}`}> 
                      <i className="bi bi-pencil-fill"></i>
                    </a>
                    <button className="btn btn-danger btn-sm">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
    </div>
  )
}

export default Questions