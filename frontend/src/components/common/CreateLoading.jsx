import React from 'react';
import '../../styles/Custom-spinner.css';
import { hatch, bouncy } from 'ldrs';

// Register LDRS components
if (typeof window !== "undefined") {
  hatch.register();
  bouncy.register();
}

const CreateLoading = ({ isVisible = true }) => {
  // If not visible, don't render anything
  if (!isVisible) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-content">
          <l-bouncy
            size="40"
            stroke="5"
            speed="2.5"
            color="white"
          ></l-bouncy>
          <p className="loading-text mt-3">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default CreateLoading;