import React, { useState } from 'react';
import { FaBars, FaHome, FaBell, FaFolderOpen, FaStickyNote, FaBookOpen, FaSearch } from 'react-icons/fa';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen, toggleSidebar }) {
    const [activeMenu, setActiveMenu] = useState('Trang chủ');
  
    const menuItems = [
      { name: 'Trang chủ', icon: <FaHome /> },
      { name: 'Thư viện của bạn', icon: <FaFolderOpen /> },
      { name: 'Thông báo', icon: <FaBell /> },
    ];
  
    const startHereItems = [
      { name: 'Thẻ ghi nhớ', icon: <FaStickyNote /> },
      { name: 'Lời giải chuyên sâu', icon: <FaBookOpen /> },
    ];
  
    const handleMenuClick = (name) => {
      setActiveMenu(name);
    };
  
    return (
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {/* Top Section */}
        <div className="top-section">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          {isOpen && <FaSearch className="logo-icon" />}
        </div>
  
        {/* Main Menu */}
        <div className="menu-section">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`menu-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.name)}
            >
              <div className="icon">{item.icon}</div>
              {isOpen && <span className="text">{item.name}</span>}
            </div>
          ))}
        </div>
  
        <div className="divider"></div>
  
        {/* Start Here */}
        <div className="start-here">
          {isOpen && <div className="section-title">Bắt đầu tại đây</div>}
          {startHereItems.map((item) => (
            <div
              key={item.name}
              className={`menu-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.name)}
            >
              <div className="icon">{item.icon}</div>
              {isOpen && <span className="text">{item.name}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
