import { useState, useRef, useEffect } from "react";
import "../../styles/NavAdminTop.css";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaBell, FaQuestion, FaArrowLeft } from "react-icons/fa";
import { IoNotifications, IoSettingsSharp } from "react-icons/io5";
import { RiDashboardLine } from "react-icons/ri";

const NavBarTop = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const auth = localStorage.getItem('token');
  const authUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    // Click outside to close dropdown
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
  
  useEffect(() => {
    // Focus search input when search box is shown
    if (showSearchBox && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBox]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/login');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSearchBox(false);
    }
  };
  
  const toggleSearchBox = () => {
    setShowSearchBox(!showSearchBox);
  };

  return (
    <nav className="admin-navbar fixed-top mb-5">
      <div className="admin-container">
        <div className="admin-navbar-left">
        </div>
        
        <div className="admin-navbar-right">
          {showSearchBox ? (
            <form className="admin-search-form" onSubmit={handleSearch}>
              <input
                type="search"
                ref={searchInputRef}
                className="admin-search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="admin-search-btn">
                <FaSearch />
              </button>
              <button 
                type="button" 
                className="admin-search-close" 
                onClick={toggleSearchBox}
              >
                &times;
              </button>
            </form>
          ) : (
            <>
              <button className="admin-icon-btn" title="Help" type="button">
                <FaQuestion />
              </button>
              <button 
                className="admin-icon-btn" 
                title="Search" 
                type="button"
                onClick={toggleSearchBox}
              >
                <FaSearch />
              </button>
              <button className="admin-icon-btn" title="Notifications" type="button">
                <IoNotifications />
                <span className="notification-badge">3</span>
              </button>
              <button className="admin-icon-btn d-none d-md-flex" title="Settings" type="button">
                <IoSettingsSharp />
              </button>
            </>
          )}
          
          {!auth ? (
            <Link to="/login" className="admin-login-btn">
              Login
            </Link>
          ) : (
            <div className="admin-user-dropdown" ref={userMenuRef}>
              <button 
                className="admin-user-btn"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
              >
                {authUser?.profileImage ? (
                  <img
                    src={authUser.profileImage}
                    alt={authUser.name || "Admin"}
                    className="admin-user-avatar"
                  />
                ) : (
                  <div className="admin-user-icon">
                    <FaUser />
                  </div>
                )}
                <span className="admin-user-name d-none d-md-inline">
                  {authUser?.name || authUser?.username || "Admin"}
                </span>
              </button>
              
              <div 
                className={`admin-dropdown-menu ${showUserMenu ? 'show' : ''}`}
              >
                <div className="admin-dropdown-header">
                  <strong>{authUser?.name || authUser?.username || "Admin"}</strong>
                  <small>{authUser?.email || "admin@example.com"}</small>
                </div>
                
                <div className="admin-dropdown-divider"></div>
                
                <Link 
                  to="/admin/profile" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FaUser className="admin-dropdown-icon" />
                  <span>My Profile</span>
                </Link>
                
                <Link 
                  to="/admin/settings" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <IoSettingsSharp className="admin-dropdown-icon" />
                  <span>Settings</span>
                </Link>
                
                <div className="admin-dropdown-divider"></div>
                
                <button 
                  className="admin-dropdown-item admin-logout-item" 
                  onClick={handleLogout}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-dropdown-icon">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBarTop;