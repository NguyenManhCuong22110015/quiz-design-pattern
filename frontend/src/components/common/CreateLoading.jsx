import React from 'react';
import '../../styles/Custom-spinner.css';
import { hatch, bouncy } from 'ldrs';

// Register LDRS components
if (typeof window !== "undefined") {
  hatch.register();
  bouncy.register();
}
const link = "https://res.cloudinary.com/dj9r2qksh/video/upload/v1742444295/Recording_2025-03-20_111752_ynsddt.mp4"
const CreateLoading = ({ isVisible = true, videoSource = link }) => {
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
          
          <div className="loading-video-container mt-3">
            <video 
              width="280" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="loading-video"
            >
              <source src={videoSource} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLoading;