import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import NavBarLeft from '../../components/Admin/NavBarLeft';
import '../../styles/NavBar.css';

const Admin = () => {
  // Track sidebar state
 

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <NavBarLeft />
      </div>
      <div className="home-section">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;