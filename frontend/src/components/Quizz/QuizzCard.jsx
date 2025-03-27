import React from 'react'
import { Card, Badge, ProgressBar } from 'react-bootstrap'
import { FaStar, FaRegStar, FaUsers, FaQuestionCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const QuizzCard = ({ quiz }) => {
  const mockQuiz = quiz || {
    id: '1',
    title: 'Khám phá thế giới động vật',
    image: 'https://img.freepik.com/free-vector/cute-animals-frame-design_1308-95237.jpg',
    rating: 4.5,
    questionCount: 10,
    participantCount: 1250,
    difficulty: 'Dễ',
    
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-warning" style={{ opacity: 0.5 }} />)
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />)
      }
    }

    return stars
  }
  return (
    <Link to={`/quiz-detail/${mockQuiz._id}`}  className="text-decoration-none">
    <Card className="quiz-card h-100 shadow-sm border-0 rounded-4 overflow-hidden" style={{ 
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'
      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)'
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={mockQuiz.image} 
          alt={mockQuiz.title}
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <Badge 
          bg="primary" 
          className="position-absolute top-0 end-0 m-2 rounded-pill px-3 py-2"
          style={{ 
            background: 'linear-gradient(45deg, #FF9800, #FF5722)',
            border: '2px solid white',
            fontSize: '0.8rem'
          }}
        >
          {mockQuiz.category}
        </Badge>

        <Badge 
          bg="success" 
          className="position-absolute bottom-0 start-0 m-2 rounded-pill px-3 py-2"
          style={{ 
            background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            border: '2px solid white',
            fontSize: '0.8rem'
          }}
        >
          {mockQuiz.difficulty}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold mb-2" style={{ fontSize: '1.2rem', color: '#3F51B5' }}>
          {mockQuiz.title}
        </Card.Title>

        <div className="d-flex align-items-center mb-2">
          <div className="me-2">
            {renderStars(mockQuiz.rating)}
          </div>
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>
            ({mockQuiz.rating})
          </span>
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <FaQuestionCircle className="text-primary me-1" />
              <span style={{ fontSize: '0.9rem' }}>{mockQuiz.questionCount} câu hỏi</span>
            </div>
            <div className="d-flex align-items-center">
              <FaUsers className="text-success me-1" />
              {/* <span style={{ fontSize: '0.9rem' }}>{mockQuiz.participantCount.toLocaleString() || ""} người chơi</span> */}
            </div>
          </div>

          <ProgressBar 
            now={70} 
            variant="info" 
            className="rounded-pill" 
            style={{ height: '8px' }}
          />
          <div className="text-center mt-2" style={{ fontSize: '0.8rem', color: '#7986CB' }}>
            70% hoàn thành mục tiêu
          </div>
        </div>
      </Card.Body>

      <div className="card-footer bg-white border-0 text-center p-2">
        <button 
          className="btn btn-primary rounded-pill px-4 py-2 w-100"
          style={{ 
            background: 'linear-gradient(45deg, #2196F3, #673AB7)',
            border: 'none',
            boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 6px 12px rgba(33, 150, 243, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)'
          }}
        >
          Bắt đầu ngay!
        </button>
      </div>
    </Card>
    </Link>
  )
}

export default QuizzCard
