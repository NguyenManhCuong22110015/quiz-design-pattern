import React, { useEffect,useState } from 'react'
import NavBar from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
import AddQuestion from '../../components/Admin/AddQuestion'
const Questions = () => {
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => {
        setShowModal(true);
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
        </div>
        </div>
    </div>
  )
}

export default Questions