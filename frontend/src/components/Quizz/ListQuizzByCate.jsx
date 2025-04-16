import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import QuizzCard from './QuizzCard';
import {getQuizzesByCategory} from '../../api/quizzApi';

const ListQuizzByCate = ({category}) => {
  // Store category data
  const [categoryData, setCategoryData] = useState({
    id: category?._id,
    name: category?.name || "Unknown",
    quizzes: [] 
  });
  
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Responsive quizzes per page - keep 1 for mobile
  const quizzesPerPage = isMobile ? 1 : 4;

  // Check screen width on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fetch quizzes data for the category
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await getQuizzesByCategory(categoryData.id);
        console.log("res: " + res);
        const quizzes = res || [];
        
        setCategoryData({
          id: category?._id,
          name: category?.name || "Unknown",
          quizzes: Array.isArray(quizzes) ? quizzes : []
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setLoading(false);
      }
    };
    
    if (category) {
      fetchQuizzes();
    }
  }, [category]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(categoryData.quizzes.length / quizzesPerPage);
  
  // Get current page's quizzes
  const getCurrentPageQuizzes = () => {
    const startIndex = currentPage * quizzesPerPage;
    const endIndex = startIndex + quizzesPerPage;
    return categoryData.quizzes.slice(startIndex, endIndex);
  };

  // Navigation handlers
  const goToNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Navigation button styles
  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.3s ease'
  };

 

  return (
    <Container className="my-5 position-relative">
      <div className="category-header d-flex align-items-center justify-content-between mb-3">
        <h3 className="d-inline-block position-relative" style={{ color: '#3F51B5' }}>
          {categoryData.name}
          <div className="position-absolute w-100" style={{ 
            height: '4px', 
            background: 'linear-gradient(90deg, #FF9800, #FF5722)',
            bottom: '-8px',
            borderRadius: '2px'
          }}></div>
        </h3>
      </div>

      {/* Carousel Container */}
      <div className="carousel-container position-relative" style={{ padding: isMobile ? '0' : '0 60px' }}>
        {/* Side Navigation Buttons - Hide on mobile */}
        {!isMobile && !loading && totalPages > 1 && (
          <>
            <Button 
              onClick={goToPrevPage}
              style={{ ...navButtonStyle, left: '0' }}
              className="prev-button"
              aria-label="Previous page"
            >
              <FaChevronLeft />
            </Button>
            
            <Button 
              onClick={goToNextPage}
              style={{ ...navButtonStyle, right: '0' }}
              className=""
              aria-label="Next page"
            >
              <FaChevronRight />
            </Button>
          </>
        )}
        
        {/* Quizzes Carousel */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentPage}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
          >
            <Row className={isMobile ? "px-0" : "px-2"}>
              {loading ? (
                <Col className="text-center py-4">
                  <p>Loading quizzes...</p>
                </Col>
              ) : categoryData.quizzes.length > 0 ? (
                getCurrentPageQuizzes().map((quiz) => (
                  <Col 
                    key={quiz._id || quiz.id} 
                    xs={12} 
                    md={3} 
                    className={`mb-4 ${isMobile ? 'px-0' : 'px-2'}`}
                    style={{ maxWidth: isMobile ? '100%' : null }}
                  >
                    <QuizzCard quiz={quiz} />
                  </Col>
                ))
              ) : (
                <Col className="text-center py-4">
                  <p>No quizzes found for this category.</p>
                </Col>
              )}
            </Row>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Bottom navigation controls - Hide buttons on mobile, keep dots */}
      {!loading && totalPages > 1 && (
        <div className="d-flex flex-column align-items-center mt-4">
          {/* Pagination Indicators */}
          <div className="pagination-dots d-flex justify-content-center">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className="pagination-dot"
                aria-label={`Go to page ${index + 1}`}
                onClick={() => setCurrentPage(index)}
                style={{
                  width: isMobile ? '15px' : '12px',
                  height: isMobile ? '15px' : '12px',
                  borderRadius: '50%',
                  margin: '0 5px',
                  background: currentPage === index ? '#3F51B5' : '#d1d1d1',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
          
          {/* Add bottom navigation buttons - Hide on mobile */}
          {!isMobile && (
            <div className="d-flex mt-3">
              <Button
                variant="outline-primary"
                onClick={goToPrevPage}
                className="me-2"
                size="sm"
              >
                <FaChevronLeft /> Previous
              </Button>
              <Button
                variant="outline-primary"
                onClick={goToNextPage}
                size="sm"
              >
                Next <FaChevronRight />
              </Button>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default ListQuizzByCate;