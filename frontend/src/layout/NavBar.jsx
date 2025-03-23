import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaQuestionCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { RiAdminLine } from "react-icons/ri";
import "../styles/NavBar.css";

const NavBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Check authentication status
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

    // Add click event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <strong>QUIZZ</strong>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            aria-controls="navbarContent"
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`}
            id="navbarContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/quizzes">Quizzes</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/generate">Create Quiz</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/room/list">Rooms</Link>
              </li>
            </ul>

            <div className="d-flex align-items-center nav-right">
              <form className="d-flex search-form me-3" onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control search-input"
                    placeholder="Search..."
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-dark search-btn" type="submit">
                    <FaSearch />
                  </button>
                </div>
              </form>

              {!user ? (
                <Link to="/login" className="btn btn-outline-success login-btn">
                  Log in
                </Link>
              ) : (
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                    className="btn user-menu-button"
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-expanded={showUserMenu}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name || "User"}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-icon">
                        <FaUser />
                      </div>
                    )}
                    <span className="user-name">{user.name || user.username}</span>
                  </button>

                  <div
                    className={`user-dropdown ${showUserMenu ? 'show' : ''}`}
                  >
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser className="item-icon" />
                      <span>Profile</span>
                    </Link>
                    
                    {user.isAdmin && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link
                          to="/admin"
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <RiAdminLine className="item-icon" />
                          <span>Admin Panel</span>
                        </Link>
                      </>
                    )}
                    
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <IoLogOut className="item-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="header-divider"></div>
    </header>
  );
};

export default NavBar;