import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUser } from "react-icons/fa";
import "../styles/Footer.css";
import "../styles/Index.css";

const NavBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="container">
      <nav className="navbar navbar-expand-md navbar-dark bg-light fixed-top">
        <Link className="navbar-brand" to="/">QUIZZ</Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-toggle="collapse" 
          data-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end mt-2 mb-2" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto"></ul>

          <form className="form-inline my-2 my-lg-0">
            <input 
              id="searchInput" 
              className="form-control mr-sm-2" 
              style={{ border: "1px solid #000000 !important" }}
              type="search" 
              placeholder="Search" 
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button id="search-icon" className="btn btn-outline-dark my-2 my-sm-0 ml-2" type="button">
              <FaSearch />
            </button>
          </form>

          {!auth ? (
            <button className="btn btn-outline-success my-2 my-sm-0 ml-2" type="button">
              <Link to="/login" style={{ color: "black" }}>Log in</Link>
            </button>
          ) : (
            <div className="dropdown ml-2">
              <button 
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUser className="mr-2 mt-1 mb-1" />
                
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
                  <FaUser className="mr-2" />
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
    </div>
  );
};

export default NavBar;