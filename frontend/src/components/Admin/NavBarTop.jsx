
const NavBarTop = () => {
    return (
      <div className="ms-5 me-5 mt-2">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="#"></a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
  
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            <div className="d-flex align-items-center">
              <i className="bi bi-question-circle-fill me-4"></i>
              <i className="bi bi-search me-4"></i>
              <i className="bi bi-bell-fill me-4"></i>
              
              <div className="dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-person-circle"></i>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="/account/profile"><i className="bi bi-person me-2"></i>Profile</a></li>
                  <li><a className="dropdown-item" href="/logout"><i className="bi bi-box-arrow-right me-2"></i>Log out</a></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
        <hr />
      </div>
    )
  }

export default NavBarTop