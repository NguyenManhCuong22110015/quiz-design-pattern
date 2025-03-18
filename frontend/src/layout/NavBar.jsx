import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUser } from "react-icons/fa";
import "../styles/Footer.css";
import "../styles/Index.css";
import { IoLogOut } from "react-icons/io5";
import { RiAdminLine  } from "react-icons/ri";

const NavBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  
  useEffect(() => {
    // Check authentication status whenever NavBar mounts or updates
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        setUser(userInfo);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div className="container">
      <nav className="navbar navbar-expand-md navbar-dark bg-light fixed-top">
        <Link className="navbar-brand" to="/">QUIZZ</Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsNavCollapsed(!isNavCollapsed)} 
          aria-controls="navbarSupportedContent" 
          aria-expanded={!isNavCollapsed ? true : false} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end mt-2 mb-2`} id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto"></ul>

          <form className="form-inline my-2 my-lg-0">
            <div className="d-flex align-items-center">
              <input 
                id="searchInput" 
                className="form-control mr-sm-2"
                type="search" 
                placeholder="Search" 
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button id="search-icon" className="btn btn-outline-dark my-2 my-sm-0 ml-2" type="button">
                <FaSearch />
              </button>
            </div>
          </form>

          <div className="ml-md-2 mt-2 mt-md-0">
            {!user ? (
              <button className="btn btn-outline-success my-2 my-sm-0" type="button">
                <Link to="/login" style={{ color: "black", textDecoration: "none" }}>Log in</Link>
              </button>
            ) : (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center ml-md-2 mt-2 mt-md-0"
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="rounded-circle mr-2"
                      style={{ width: "24px", height: "24px" }} 
                    />
                  ) : (
                    <FaUser className="mr-2 mt-1 mb-1" />
                  )}
                 
                </button>
                
                <div 
                  className={`dropdown-menu dropdown-menu-right mt-3 ${showUserMenu ? 'show' : ''}`}
                  style={{
                    position: 'absolute',
                    transform: 'translate3d(0px, 38px, 0px)',
                    top: '0px',
                    left: 'auto',
                    right: '0px',
                    willChange: 'transform',
                    border: '1px solid black',          
                   
                  }}
                >
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser className="mr-2 me-2 mb-1" />
                    Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to="/admin" 
                    className="dropdown-item"
                    
                  >
                    <RiAdminLine 
                    className="mr-2 me-2 mb-1" />
                    Admin
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  ><IoLogOut className="mr-2 me-2 mb-1"/>

                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;