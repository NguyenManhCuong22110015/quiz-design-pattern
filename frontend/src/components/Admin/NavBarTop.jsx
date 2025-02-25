import { useState } from "react";
import "../../styles/NavAdminTop.css";
import { Link } from "react-router-dom";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { FaQuestion } from "react-icons/fa";


const NavBarTop = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const auth = localStorage.getItem('token');
  const authUser = JSON.parse(localStorage.getItem('user'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };
    return (
      <nav className="navbarr fixed-top">
      <div className="navbar-logo"></div>
        <div className="d-flex justify-content-end ">
        <button id="" className="btn btn-outline-dark my-2 my-sm-0 ml-2" type="button">
                    <FaQuestion />
        </button>
        <button id="search-icon" className="btn btn-outline-dark my-2 my-sm-0 ml-2" type="button">
                    <FaSearch />
        </button>
        <button id="" className="btn btn-outline-dark my-2 my-sm-0 ml-2" type="button">
                    <IoNotifications />
        </button>
      {!auth ? (
            <button className="btn btn-outline-success my-2 my-sm-0 ml-2" style={{border: "0px"}} type="button">
              <Link to="/login" style={{ color: "black" }}>Log in</Link>
            </button>
          ) : (
            <div className="dropdown ml-2">
              <button 
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUser className="me-2 mt-1 mb-1" />
                
              </button>
              
              <div 
                className={`dropdown-menu dropdown-menu-right ${showUserMenu ? 'show' : ''}`}
                style={{
                  position: 'absolute',
                  transform: 'translate3d(0px, 38px, 0px)',
                  top: '0px',
                  left: 'auto',
                  right: '0px',
                  willChange: 'transform'
                }}
              >
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FaUser className="me-2 mb-1  " />
                  Profile
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
    </nav>
    )
  }

export default NavBarTop