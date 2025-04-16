import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import NavBarLeft from '../../components/Admin/NavBarLeft';
import NavBarTop from '../../components/Admin/NavBarTop';
import { Card, Row, Col, Table, Badge, ProgressBar, Button, Dropdown } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FaUsers, FaQuestionCircle, FaGamepad, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FiDownload, FiCalendar, FiRefreshCw, FiFilter } from 'react-icons/fi';
import '../../styles/NavBar.css';
import '../../styles/AdminDashboard.css';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  ChartTooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title
);

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [statsSummary, setStatsSummary] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalPlayers: 0,
    totalCategories: 0,
    gamesPlayed: 0
  });
  const [topPlayers, setTopPlayers] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState({});
  const [playerActivity, setPlayerActivity] = useState({});
  const [compareStats, setCompareStats] = useState({});
  const [timeFilter, setTimeFilter] = useState('month'); // 'week', 'month', 'year'

  // Load mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Summary statistics
      setStatsSummary({
        totalQuizzes: 128,
        totalQuestions: 2456,
        totalPlayers: 895,
        totalCategories: 24,
        gamesPlayed: 5240
      });

      // Top players
      setTopPlayers([
        { id: 1, name: 'Alexander Wong', avatar: null, score: 9845, games: 34, winRate: 82 },
        { id: 2, name: 'Maria Johnson', avatar: null, score: 8732, games: 41, winRate: 78 },
        { id: 3, name: 'David Chen', avatar: null, score: 7610, games: 28, winRate: 75 },
        { id: 4, name: 'Sophie Williams', avatar: null, score: 6543, games: 32, winRate: 69 },
        { id: 5, name: 'James Rodriguez', avatar: null, score: 5987, games: 26, winRate: 65 }
      ]);

      // Recent quizzes
      setRecentQuizzes([
        { id: 1, title: 'Science Quiz: Elements and Compounds', plays: 245, avgScore: 78, category: 'Science' },
        { id: 2, title: 'World History: Medieval Period', plays: 189, avgScore: 65, category: 'History' },
        { id: 3, title: 'Mathematics Challenge', plays: 156, avgScore: 62, category: 'Mathematics' },
        { id: 4, title: 'Popular Literature', plays: 132, avgScore: 85, category: 'Literature' },
        { id: 5, title: 'Geography: Countries and Capitals', plays: 128, avgScore: 74, category: 'Geography' }
      ]);

      // Player activity data for line chart
      setPlayerActivity({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Active Players',
            data: [65, 72, 86, 95, 112, 130, 135, 142, 158, 175, 190, 205],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Quiz Plays',
            data: [120, 150, 180, 210, 250, 320, 350, 410, 450, 520, 580, 650],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      });

      // Category distribution data for doughnut chart
      setCategoryDistribution({
        labels: ['Science', 'History', 'Mathematics', 'Literature', 'Geography', 'Others'],
        datasets: [
          {
            data: [25, 20, 15, 18, 12, 10],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)'
            ],
            borderWidth: 1
          }
        ]
      });
      
      // Compare stats data for bar chart
      setCompareStats({
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'This Month',
            data: [65, 78, 82, 75],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
          },
          {
            label: 'Last Month',
            data: [54, 65, 60, 70],
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
          }
        ]
      });

      setIsLoading(false);
    }, 1200);
  }, []);

  // Helper functions
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Generate random trend percentages
  const getTrendPercent = () => {
    return (Math.random() * 20 - 5).toFixed(1);
  };

  const getRandomTrend = () => {
    const value = getTrendPercent();
    return {
      value: value,
      isUp: parseFloat(value) > 0
    };
  };

  // Options for charts
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Player Activity & Quiz Plays Over Time',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Quiz Completion Rate Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion Rate (%)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Quiz Distribution by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  // UI elements
  const StatCard = ({ title, value, icon, trend, color }) => (
    <Card className="stat-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="stat-title text-muted mb-0">{title}</p>
            <h3 className="stat-value mt-2 mb-2">{formatNumber(value)}</h3>
            <div className={`trend-badge ${trend.isUp ? 'trend-up' : 'trend-down'}`}>
              {trend.isUp ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
              <span>{Math.abs(trend.value)}% {trend.isUp ? 'increase' : 'decrease'}</span>
            </div>
          </div>
          <div className={`stat-icon-wrapper ${color}`}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <NavBarLeft />
      </div>
      <div className="home-section">
        <NavBarTop />
        <div className="content-wrapper">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading dashboard...</span>
              </div>
              <p className="mt-3 text-muted">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Header */}
              <div className="dashboard-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="dashboard-title">Quiz Analytics Dashboard</h2>
                    <p className="text-muted">Overview of your quiz platform performance and statistics</p>
                  </div>
                  <div className="dashboard-actions d-flex gap-2">
                    <Dropdown>
                      <Dropdown.Toggle variant="light" id="dropdown-time-filter" className="d-flex align-items-center">
                        <FiCalendar className="me-2" />
                        {timeFilter === 'week' ? 'This Week' : timeFilter === 'month' ? 'This Month' : 'This Year'}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setTimeFilter('week')}>This Week</Dropdown.Item>
                        <Dropdown.Item onClick={() => setTimeFilter('month')}>This Month</Dropdown.Item>
                        <Dropdown.Item onClick={() => setTimeFilter('year')}>This Year</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    <Button variant="primary" className="d-flex align-items-center">
                      <FiDownload className="me-2" /> Export Report
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Summary Cards */}
              <Row className="g-4 mb-4">
                <Col lg={3} sm={6}>
                  <StatCard 
                    title="Total Quizzes" 
                    value={statsSummary.totalQuizzes} 
                    icon={<FaGamepad size={24} />} 
                    trend={getRandomTrend()} 
                    color="blue"
                  />
                </Col>
                <Col lg={3} sm={6}>
                  <StatCard 
                    title="Total Questions" 
                    value={statsSummary.totalQuestions} 
                    icon={<FaQuestionCircle size={24} />} 
                    trend={getRandomTrend()} 
                    color="green"
                  />
                </Col>
                <Col lg={3} sm={6}>
                  <StatCard 
                    title="Active Players" 
                    value={statsSummary.totalPlayers} 
                    icon={<FaUsers size={24} />} 
                    trend={getRandomTrend()} 
                    color="orange"
                  />
                </Col>
                <Col lg={3} sm={6}>
                  <StatCard 
                    title="Games Played" 
                    value={statsSummary.gamesPlayed} 
                    icon={<FaTrophy size={24} />} 
                    trend={getRandomTrend()} 
                    color="purple"
                  />
                </Col>
              </Row>

              {/* Main Dashboard Content */}
              <Row className="g-4 mb-4">
                {/* Player Activity Chart */}
                <Col lg={8}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title">Player Activity Trends</h5>
                        <Button variant="outline-secondary" size="sm" className="d-flex align-items-center">
                          <FiRefreshCw className="me-1" /> Refresh
                        </Button>
                      </div>
                      <div style={{ height: '350px' }}>
                        <Line data={playerActivity} options={lineChartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Category Distribution */}
                <Col lg={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title">Category Distribution</h5>
                        <Button variant="outline-secondary" size="sm" className="btn-icon">
                          <FiFilter />
                        </Button>
                      </div>
                      <div style={{ height: '350px' }} className="d-flex align-items-center justify-content-center">
                        <Doughnut data={categoryDistribution} options={doughnutOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-4 mb-4">
                {/* Recent Quizzes */}
                <Col lg={8}>
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title">Recently Active Quizzes</h5>
                        <Button as="a" href="/admin/quizz" variant="outline-primary" size="sm">
                          View All Quizzes
                        </Button>
                      </div>
                      <div className="table-responsive">
                        <Table hover className="align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Quiz Title</th>
                              <th>Category</th>
                              <th>Plays</th>
                              <th>Avg. Score</th>
                              <th>Performance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentQuizzes.map(quiz => (
                              <tr key={quiz.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="quiz-icon-wrapper me-2">
                                      <FaGamepad />
                                    </div>
                                    <span className="fw-medium">{quiz.title}</span>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="light" text="dark" className="category-badge">
                                    {quiz.category}
                                  </Badge>
                                </td>
                                <td>{quiz.plays}</td>
                                <td>{quiz.avgScore}%</td>
                                <td>
                                  <ProgressBar 
                                    now={quiz.avgScore} 
                                    variant={quiz.avgScore > 75 ? "success" : quiz.avgScore > 60 ? "info" : "warning"}
                                    style={{ height: "8px" }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Top Players */}
                <Col lg={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title">Top Players</h5>
                        <Badge bg="warning" className="text-dark">
                          <FaTrophy size={14} className="me-1" /> Leaderboard
                        </Badge>
                      </div>
                      
                      <div className="top-players-list">
                        {topPlayers.map((player, index) => (
                          <div key={player.id} className="player-rank-item">
                            <div className="d-flex align-items-center">
                              <div className={`player-rank rank-${index + 1}`}>
                                {index + 1}
                              </div>
                              <div className="player-avatar-wrapper">
                                {player.avatar ? (
                                  <img src={player.avatar} alt={`${player.name}'s avatar`} className="player-avatar" />
                                ) : (
                                  <div className="player-avatar-placeholder">
                                    {player.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="player-info">
                                <h6 className="player-name mb-0">{player.name}</h6>
                                <div className="d-flex player-stats">
                                  <span className="me-2"><small>{player.games} games</small></span>
                                  <span><small className="text-success">{player.winRate}% win rate</small></span>
                                </div>
                              </div>
                              <div className="player-score ms-auto fw-bold">
                                {formatNumber(player.score)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Additional Chart */}
              <Row className="g-4">
                <Col lg={12}>
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title">Quiz Completion Rate Comparison</h5>
                        <Dropdown>
                          <Dropdown.Toggle variant="light" id="dropdown-basic" className="btn-sm">
                            <FiFilter className="me-1" /> Filter Data
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item>By Category</Dropdown.Item>
                            <Dropdown.Item>By Difficulty</Dropdown.Item>
                            <Dropdown.Item>By Time Period</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      <div style={{ height: '300px' }}>
                        <Bar data={compareStats} options={barChartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;