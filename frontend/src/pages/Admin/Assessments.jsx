import { useEffect } from 'react'
import NavBar from '../../components/Admin/NavBarLeft'
import '../../styles/Assessments.css'
import NavBarTop from '../../components/Admin/NavBarTop'
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
      <div className='home-section'>
          <NavBarTop />
          <div className="container-fluid mt-3">
            <div className="d-flex justify-content-between">
              <h3>Assessments</h3>
              <button className="btn btn-success me-3">
              <i className="bi bi-patch-plus-fill me-3"></i>
                Add a assessment
              </button> 
            </div>
            <table className="table">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Created</th>
                    <th scope="col">Points</th>
                    <th scope="col">Questions</th>
                    <th scope="col">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>Assessment 1</td>
                    <td>2021-10-10</td>
                    <td>10</td>
                    <td>10</td>
                    <td>
                      <a className="btn btn-primary me-2" href="/admin/question">
                        <i className="bi bi-pencil-fill"></i>
                      </a>
                      
                    </td>
                  </tr>
                </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}

export default Admin