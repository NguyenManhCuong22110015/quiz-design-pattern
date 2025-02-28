import React from 'react';
import '../../styles/Custom-spinner.css'; // Đảm bảo rằng bạn đã tạo file CSS này
import { hatch, bouncy } from 'ldrs';


// Default values shown  

// Default values shown  
if (typeof window !== "undefined") {
  hatch.register(); // Add this line
  bouncy.register(); // Add this line
}
const CreateLoading = () => {
  return (
    <div>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <span className="sr-only me-3 ">Loading...  </span>
       
        <l-hatch
          size="28"
          stroke="4"
          speed="3.5"
          color="green" 
        ></l-hatch>
        
    </div>
     
    </div>
  );
};

export default CreateLoading;
