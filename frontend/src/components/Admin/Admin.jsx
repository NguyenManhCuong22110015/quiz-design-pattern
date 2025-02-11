import { useEffect } from 'react'
import NavBarLeft from './NavBarLeft'
import './NavBar.css'
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
    <div className='sidebar'>
      <NavBarLeft />
    </div>
  )
}

export default Admin