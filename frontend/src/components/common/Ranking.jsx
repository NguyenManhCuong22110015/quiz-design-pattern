import React, { useEffect, useState } from 'react';
import { Table, Container, Badge, Row, Col, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Ranking.css'; 
import {  FaTrophy } from 'react-icons/fa';

/**
 * Component hiển thị bảng xếp hạng người dùng
 * @param {Object} props
 * @param {Array} props.users - Mảng người dùng với thông tin điểm số
 * @param {string} props.title - Tiêu đề của bảng xếp hạng (optional)
 */
const Ranking = ({ users = [], title = "Bảng xếp hạng" }) => {
  const [sortedUsers, setSortedUsers] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [remainingUsers, setRemainingUsers] = useState([]);

  useEffect(() => {
    // Sắp xếp users theo điểm số từ cao đến thấp
    const sorted = [...users].sort((a, b) => b.score - a.score);
    setSortedUsers(sorted);

    // Lấy top 3 người chơi
    const top3 = sorted.slice(0, 3);
    setTopThree(top3);

    // Lấy những người còn lại
    const remaining = sorted.slice(3);
    setRemainingUsers(remaining);
  }, [users]);

  // Hiển thị huy chương cho top 3
  const renderMedal = (position) => {
    switch (position) {
      case 0:
        return <div className="medal gold-medal">1</div>;
      case 1:
        return <div className="medal silver-medal">2</div>;
      case 2:
        return <div className="medal bronze-medal">3</div>;
      default:
        return null;
    }
  };

  // Hiển thị avatar với border color tương ứng
  const renderAvatar = (user, position) => {
    let borderClass = "";
    
    if (position === 0) borderClass = "gold-border";
    else if (position === 1) borderClass = "silver-border";
    else if (position === 2) borderClass = "bronze-border";
    
    return (
      <div className={`avatar-container ${borderClass}`}>
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
          alt={user.name}
          className="user-avatar"
        />
        {position < 3 && renderMedal(position)}
      </div>
    );
  };

  return (
    <Container className="ranking-container py-4">
      <h2 className="text-center ranking-title mb-5">
          <FaTrophy className="text-warning me-2" />
        {title}
        <div className="title-underline"></div>
      </h2>

      {/* Top 3 Winners Section */}
      <Row className="top-winners mb-5">
        <AnimatePresence>
          {topThree.map((user, index) => {
           
            let colClass, orderClass;
            
            switch (index) {
              case 0: // First place - center
                colClass = "col-md-4 order-md-2";
                orderClass = "first-place";
                break;
              case 1: // Second place - left
                colClass = "col-md-4 order-md-1";
                orderClass = "second-place";
                break;
              case 2: // Third place - right
                colClass = "col-md-4 order-md-3";
                orderClass = "third-place";
                break;
              default:
                colClass = "col-md-4";
                orderClass = "";
            }
            
            return (
              <motion.div
                key={user.id || index}
                className={`${colClass} mb-4`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Card className={`winner-card ${orderClass}`}>
                  <div className="position-relative text-center p-3">
                    {renderAvatar(user, index)}
                    
                    <h3 className="user-name mt-2">{user.name}</h3>
                    
                    <motion.div 
                      className="score-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.5 + index * 0.2,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <Badge bg={index === 0 ? "warning" : index === 1 ? "secondary" : "danger"} className="fs-6 px-3 py-2">
                        {user.score} điểm
                      </Badge>
                    </motion.div>
                    
                    {index === 0 && (
                      <motion.div 
                        className="crown"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        👑
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Row>

      {/* Remaining Rankings Table */}
      <Card className="ranking-table-card">
        <Card.Body>
          <Table responsive hover className="ranking-table">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th>Người chơi</th>
                <th className="text-center">Điểm số</th>
              </tr>
            </thead>
            <tbody>
              {remainingUsers.map((user, index) => (
                <motion.tr
                  key={user.id || index + 3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="ranking-row"
                >
                  <td className="text-center align-middle">
                    <span className="rank-number">{index + 4}</span>
                  </td>
                  <td className="user-cell">
                    <div className="d-flex align-items-center">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                        alt={user.name}
                        className="small-avatar me-3"
                      />
                      <span className="user-name-table">{user.name}</span>
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    <Badge bg="primary" className="score-badge-table">
                      {user.score}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
              
              {remainingUsers.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    Chưa có người chơi nào khác tham gia
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Ranking;