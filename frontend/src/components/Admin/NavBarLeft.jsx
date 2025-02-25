
const NavBarLeft = () => {
  return (
    <div className="">
      <div className="logo-details">
        <i className='bx bxs-terminal'></i>
        <div className="logo_name">Admin</div>
        <i className='bx bx-menu' id="btn"></i>
      </div>
      <ul className="nav-list">
        <li>
          <a href="/admin">
            <i className='bx bxs-category'></i>
            <span className="links_name">Dashboard</span>
          </a>
          <span className="tooltip">Dashboard</span>
        </li>
        <li>
          <a href="/admin/quizz">
            <i className='bx bxs-archive'></i>
            <span className="links_name">Quizzes</span>
          </a>
          <span className="tooltip">Quizzes</span>
        </li>
      </ul>
      
    </div>
    
  )
}

export default NavBarLeft