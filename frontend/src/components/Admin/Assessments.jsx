import { useEffect } from 'react'
import NavBar from './NavBar'
import './Assessments.css'
const Admin = () => {
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
      <div className="content">
        <section className="home-section">
          <div className="container">
            <div className="top">
                <div className="d-flex justify-content-end">
                <a href="/admin">
            <i className='bx bxs-category'></i>
            <span className="links_name">Dashboard</span>
          </a>

                </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Admin