import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { rateQuiz } from '../../api/quizzApi';
import { toast } from 'react-toastify';

const RateQuiz = ({ quizId, initialRating = 0, onRatingUpdated, userRating = 0 }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra nếu người dùng đã đánh giá trước đó
  const hasUserRated = userRating > 0;

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
    setShowConfirmModal(true);
  };

  const handleMouseEnter = (hoveredRating) => {
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleConfirmRating = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await rateQuiz(quizId, rating);
      
      if (response.success) {
        toast.success('Cảm ơn bạn đã đánh giá!');
        
        // Gọi callback để cập nhật UI cha
        if (onRatingUpdated) {
          onRatingUpdated(response.averageRating || rating);
        }
      } else {
        toast.error('Có lỗi khi gửi đánh giá.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Cập nhật trong phần renderStar (thêm thông số cho shadow và stroke)
  const renderStar = (position) => {
    const isActive = (hoverRating || rating || userRating) >= position;
    const isUserRated = userRating >= position;
    
    return (
      <FaStar
        key={position}
        className={`star-rating ${isActive ? 'active' : ''} ${isUserRated ? 'user-rated' : ''}`}
        color={isActive ? '#FFD700' : '#e4e5e9'}
        size={28}
        style={{ 
          cursor: 'pointer',
          marginRight: '5px',
          transition: 'color 200ms, transform 200ms, filter 200ms',
          transform: (hoverRating === position) ? 'scale(1.2)' : 'scale(1)',
          filter: isActive ? 'drop-shadow(0 0 1px #BB8A00)' : 'drop-shadow(0 0 1px #999)',
        }}
        onClick={() => !hasUserRated && handleStarClick(position)}
        onMouseEnter={() => !hasUserRated && handleMouseEnter(position)}
        onMouseLeave={() => !hasUserRated && handleMouseLeave()}
      />
    );
  };

  return (
    <div className="rating-container ">
      <div className="d-flex flex-column align-items-center">
        <div className="stars-container mb-2">
          {[1, 2, 3, 4, 5].map(position => renderStar(position))}
        </div>
        
        {hasUserRated ? (
          <small className="text-success">Bạn đã đánh giá {userRating} sao</small>
        ) : (
          <small className="text-muted">Nhấp để đánh giá</small>
        )}
      </div>

      {/* Modal xác nhận đánh giá */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn muốn đánh giá quiz này {rating} sao?</p>
          <div className="text-center">
            {[1, 2, 3, 4, 5].map(pos => (
              <FaStar 
                key={pos} 
                color={pos <= rating ? '#FFD700' : '#e4e5e9'} 
                size={32}
                style={{ margin: '0 5px' }}
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmRating}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang gửi...
              </>
            ) : 'Xác nhận'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .star-rating {
          transition: color 200ms, transform 200ms;
        }
        .star-rating:hover {
          transform: scale(1.2);
        }
        .star-rating.user-rated {
          color: #FFD700 !important;
        }
        .stars-container {
          display: flex;
          align-items: center;
          
        }
      `}</style>
    </div>
  );
};

export default RateQuiz;