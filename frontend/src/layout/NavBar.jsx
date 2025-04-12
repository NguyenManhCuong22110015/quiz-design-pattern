import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FaUser, FaQuestionCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { RiAdminLine } from "react-icons/ri";
import "./../styles/NavBar.css";
import { MdQuiz } from "react-icons/md";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
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
    window.location.href = '/login';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm fixed w-100 z-10">
      <nav className="container py-3 d-flex justify-content-between align-items-center">
        {/* Logo */}
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center justify-content-center " style={{ width: 40, height: 40 }}>
            <a href="/"><img src="/imgs/logov2.png" style={{"width": "150%"}} alt="Logo" /></a>
          </div>
          <span className="fs-5 fw-bold text-dark d-none d-sm-inline ms-2">Quizz</span>
        </div>

        {/* Navigation */}
        <ul className="d-none d-md-flex list-unstyled m-0 gap-4 align-items-center">
          <li className="nav-item">
            <a href="/room/list" className="nav-link text-secondary text-decoration-none fw-medium">Rooms</a>
          </li>
          <li className="nav-item">
            <a href="category" className="nav-link text-secondary text-decoration-none fw-medium">Categories</a>
          </li>
          <li className="nav-item">
            <a href="leaderboard" className="nav-link text-secondary text-decoration-none fw-medium">Leaderboard</a>
          </li>
          <li className="nav-item">
            <a href="/generate" className="nav-link text-secondary text-decoration-none fw-medium">Create</a>
          </li>
        </ul>

        {/* Auth Buttons or User Menu */}
        <div className="d-flex align-items-center gap-2">
          {!user ? (
            <>
              <a href="/login" className="btn btn-outline-success d-none d-sm-inline">Log In</a>
              <a href="/login" className="btn btn-success">Sign Up</a>
            </>
          ) : (
            <div className="user-menu-wrapper position-relative" ref={userMenuRef}>
              <button
                className="btn d-flex align-items-center gap-2"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || "User"}
                    className="rounded-circle"
                    style={{ width: "32px", height: "32px", objectFit: "cover" }}
                  />
                ) : (
                  <div className="rounded-circle bg-success bg-opacity-25 text-success d-flex align-items-center justify-content-center" 
                       style={{ width: "32px", height: "32px" }}>
                    <FaUser />
                  </div>
                )}
                <span className="d-none d-sm-inline text-dark">{user.name || user.username}</span>
              </button>

              {/* User dropdown menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="position-absolute end-0 mt-2 py-2 bg-white rounded shadow-sm"
                    style={{ width: "200px", zIndex: 1000, border: "1px solid rgba(0, 0, 0, 0.1)" }}
                  >
                    <a href="/profile" className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark hover-bg-light">
                      <FaUser className="text-secondary" size={16} />
                      <span>Profile</span>
                    </a>
                    
                    {user.isAdmin && (
                      <>
                        <div className="dropdown-divider my-2"></div>
                        <a href="/admin" className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark hover-bg-light">
                          <RiAdminLine className="text-secondary" size={16} />
                          <span>Admin Panel</span>
                        </a>
                      </>
                    )}
                    
                    <div className="dropdown-divider my-2"></div>
                    <a href="/admin/quizz" className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark hover-bg-light">
                      <MdQuiz className="text-success" size={16} />
                      <span className="text-success">Your Quizzes</span>
                    </a>
                    <div className="dropdown-divider my-2"></div>
                    <button
                      className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-danger border-0 bg-transparent w-100 text-start hover-bg-light"
                      onClick={handleLogout}
                    >
                      <IoLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="btn btn-link text-secondary d-md-none p-0" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white shadow-sm d-md-none"
          >
            <div className="container py-3">
              <ul className="list-unstyled mb-0">
                <li className="mb-2 mobile-nav-item">
                  <a href="/room/list" className="mobile-nav-link text-secondary text-decoration-none d-block py-2">Rooms</a>
                </li>
                <li className="mb-2 mobile-nav-item">
                  <a href="category" className="mobile-nav-link text-secondary text-decoration-none d-block py-2">Categories</a>
                </li>
                <li className="mb-2 mobile-nav-item">
                  <a href="leaderboard" className="mobile-nav-link text-secondary text-decoration-none d-block py-2">Leaderboard</a>
                </li>
                <li className="mb-2 mobile-nav-item">
                  <a href="/generate" className="mobile-nav-link text-secondary text-decoration-none d-block py-2">Create</a>
                </li>
                {!user && (
                  <>
                    <li className="mb-2 pt-2">
                      <a href="/login" className="btn btn-outline-success w-100">Log In</a>
                    </li>
                    <li className="pt-1">
                      <a href="/register" className="btn btn-success w-100">Sign Up</a>
                    </li>
                  </>
                )}
                {user && (
                  <>
                    <li className="mb-2 mobile-nav-item pt-2">
                      <a href="/profile" className="mobile-nav-link text-secondary text-decoration-none d-block py-2">
                        <FaUser className="me-2" /> Profile
                      </a>
                    </li>
                    {user.isAdmin && (
                      <li className="mb-2 mobile-nav-item">
                        <a href="/admin" className="mobile-nav-link text-secondary text-decoration-none d-block py-2">
                          <RiAdminLine className="me-2" /> Admin Panel
                        </a>
                      </li>
                    )}
                    <li className="pt-1">
                      <button onClick={handleLogout} className="btn btn-outline-danger w-100">
                        <IoLogOut className="me-2" /> Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* Nav link hover effects */
        .nav-item {
          position: relative;
        }
        
        .nav-link {
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--bs-success);
          transition: width 0.3s ease;
        }
        
        .nav-item:hover .nav-link {
          color: var(--bs-success) !important;
          transform: translateY(-2px);
        }
        
        .nav-item:hover .nav-link::after {
          width: 100%;
        }
        
        /* Mobile nav hover effects */
        .mobile-nav-link {
          border-radius: 8px;
          transition: all 0.3s ease;
          padding-left: 10px !important;
        }
        
        .mobile-nav-item:hover .mobile-nav-link {
          color: var(--bs-success) !important;
          background-color: rgba(var(--bs-success-rgb), 0.1);
          padding-left: 15px !important;
        }
        
        /* Dropdown hover effect */
        .hover-bg-light:hover {
          background-color: rgba(0,0,0,0.05);
        }
      `}</style>
    </header>
  );
}
