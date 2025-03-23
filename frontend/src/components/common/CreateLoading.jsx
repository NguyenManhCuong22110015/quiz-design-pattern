import React, { useEffect } from 'react';
import '../../styles/Custom-spinner.css';
import { hatch, bouncy } from 'ldrs';

// Register LDRS components
if (typeof window !== "undefined") {
  hatch.register();
  bouncy.register();
}

const link = "https://res.cloudinary.com/dj9r2qksh/video/upload/v1742444295/Recording_2025-03-20_111752_ynsddt.mp4";

const CreateLoading = ({ isVisible = true, videoSource = link }) => {
  // Prevent background scrolling when loading is visible
  useEffect(() => {
    if (isVisible) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Disable scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Disable pointer events on all other elements
      document.querySelectorAll('body > *:not(.loading-overlay)').forEach(el => {
        el.setAttribute('aria-hidden', 'true');
      });
      
      return () => {
        // Re-enable scrolling when component unmounts
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        // Re-enable pointer events
        document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
          el.removeAttribute('aria-hidden');
        });
      };
    }
  }, [isVisible]);
  
  // If not visible, don't render anything
  if (!isVisible) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-content">
          <l-bouncy
            size="45"
            stroke="5"
            speed="2.5"
            color="white"
          ></l-bouncy>
          <p className="loading-text mt-3">Please wait...</p>
          
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