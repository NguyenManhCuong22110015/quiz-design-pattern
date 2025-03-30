import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
const NavBarLeft = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.querySelector("#btn");

    if (sidebar && !sidebar.classList.contains("open")) {
      sidebar.classList.add("open");
      sidebar.classList.remove("closed");
    }

    const updateMenuBtnIcon = () => {
      if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
      } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
      }
    };

    if (closeBtn) {
      updateMenuBtnIcon();
    }

    const toggleSidebar = () => {
      sidebar.classList.toggle("open");
      sidebar.classList.toggle("closed");
      setSidebarOpen(!sidebarOpen);
      updateMenuBtnIcon();
    };

    // Add click event listener
    if (closeBtn) {
      closeBtn.addEventListener("click", toggleSidebar);
    }

    // Cleanup
    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener("click", toggleSidebar);
      }
    };
  }, [sidebarOpen]);
  const isLinkActive = (path) => {
    if (path === '/admin' && currentPath === '/admin') {
      return true;
    }
    if (path !== '/admin' && currentPath.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <div className="">
      <div className="logo-details">
       <a href="/"> <i className='bx bxs-terminal'></i></a>
        <span className="logo_name">Admin</span>
        <i className='bx bx-menu' id="btn"></i>
      </div>
      <ul className="nav-list">
        <li>
          <a href="/admin" className={isLinkActive('/admin') && !currentPath.includes('/admin/') ? 'active' : ''}>
            <i className='bx bxs-category'></i>
            <span className="links_name">Dashboard</span>
          </a>
          <span className="tooltip">Dashboard</span>
        </li>
        <li>
          <a href="/admin/quizz" className={isLinkActive('/admin/quizz') ? 'active' : ''}>
            <i className='bx bxs-archive'></i>
            <span className="links_name">Quizzes</span>
          </a>
          <span className="tooltip">Quizzes</span>
        </li>
        <li>
          <a href="/admin/category" className={isLinkActive('/admin/category') ? 'active' : ''}>
            <i className='bx bxs-archive'></i>
            <span className="links_name">Category</span>
          </a>
          <span className="tooltip">Category</span>
        </li>
      </ul>
    </div>
  );
};

export default NavBarLeft;