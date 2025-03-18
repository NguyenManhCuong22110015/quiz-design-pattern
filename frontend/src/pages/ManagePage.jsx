import React, { useState } from 'react'
import Sidebar from '../layout/Sidebar'
const ManagePage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  
    return (
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
          <h1>Nội dung trang</h1>
          <p>Đây là phần nội dung co dãn theo sidebar.</p>
        </div>
      </div>
    );
}

export default ManagePage