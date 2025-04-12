import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useAnimations } from "./../hooks/useAnimations";
import { Button } from "./../ui/button";
import "./../../styles/DailyChallengesSection.css";
import error from '../../assets/error.jpg'
import { Link } from "react-router-dom";
export default function DailyChallengesSection({ challenges = [] }) {
  const { staggerContainer, fadeInUp } = useAnimations();

  const displayChallenges = challenges.length > 0 ? challenges : [
    {
      _id: 1,
      title: "Pattern Recall",
      description: "Memorize and reproduce increasingly complex patterns in this memory-boosting challenge.",
      categoryId: 1,
      emoji: "🧩",
      colorFrom: "bg-primary",
      colorTo: "bg-purple",
      duration: 300,
      difficulty: 1,
      playCount: 2300,
      isActive: true
    },
    {
      _id: 2,
      title: "Speed Calculation",
      description: "Solve arithmetic problems against the clock to sharpen your mental math abilities.",
      categoryId: 2,
      emoji: "🔢",
      colorFrom: "bg-warning",
      colorTo: "bg-warning",
      duration: 300,
      difficulty: 1,
      playCount: 1800,
      isActive: true
    },
    {
      _id: 3,
      title: "Word Association",
      description: "Rapidly connect related words to enhance your verbal fluency and association skills.",
      categoryId: 3,
      emoji: "🔤",
      colorFrom: "bg-success",
      colorTo: "bg-teal",
      duration: 300,
      difficulty: 1,
      playCount: 1500,
      isActive: true
    },
    {
      _id: 4,
      title: "Logical Puzzles",
      description: "Solve mind-bending puzzles that test your deductive reasoning and problem-solving.",
      categoryId: 4,
      emoji: "🧠",
      colorFrom: "bg-info",
      colorTo: "bg-primary",
      duration: 300,
      difficulty: 1,
      playCount: 2100,
      isActive: true
    }
  ];

  const categoryNames = {
    1: "Memory",
    2: "Math",
    3: "Verbal",
    4: "Logic",
    5: "Perception",
    6: "Speed"
  };

  const formatPlayCount = (count) => {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  };

  return (
    <section id="challenges" className="py-5 bg-light">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="h2 fw-bold text-dark mb-2">Today's Challenges</h2>
            <p className="text-muted">Fresh challenges updated daily. Complete all for bonus points!</p>
          </motion.div>
          <motion.div
            className="mt-3 mt-md-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="/category" className="text-decoration-none">
              <Button variant="link" className="text-light d-flex align-items-center">
                See All Challenges
                <ChevronRight className="ms-1" size={18} />
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Challenge cards */}
        <motion.div
          className="row g-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {displayChallenges.map((challenge, index) => (
            <motion.div
              key={challenge._id}
              variants={fadeInUp}
              className="col-12 col-sm-6 col-lg-3"
            >
              <Link to={`/quiz-detail/${challenge._id}`} className="text-decoration-none">
              <div 
                className="card border-0 shadow-sm h-100 transition-all hover-card" 
                style={{ 
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                 { challenge.isActive ? (
                   <div 
                   className={`position-relative text-white ${challenge.colorFrom} d-flex align-items-center justify-content-center card-header-hover`} 
                   style={{ 
                     height: "9rem", 
                     borderTopLeftRadius: ".5rem", 
                     borderTopRightRadius: ".5rem",
                     transition: "all 0.3s ease"
                   }}
                 >
                   <div className="fs-2 challenge-emoji">{challenge.emoji}</div>
 
                   <span className="badge bg-light text-dark position-absolute top-0 start-0 m-2 px-2 py-1 small">
                     {categoryNames[challenge.categoryId] || "Category"}
                   </span>
                   <span className="badge bg-dark position-absolute top-0 end-0 m-2 px-2 py-1 small">
                     {challenge.duration / 60} min
                   </span>
                 </div>
                 )  : (
                  <div>
                    <img  src={challenge.image || error} className="image-challenge"   
                    style={{ 
                     height: "9rem", 
                     borderTopLeftRadius: ".5rem", 
                     borderTopRightRadius: ".5rem",
                     transition: "all 0.3s ease"
                   }}
                   onError={(e) => {
                               e.target.onerror = null; 
                               e.target.src = error;
                    }}
                   
                   ></img>
                  </div>
                 )}

                <div className="card-body bg-white">
                  <h5 className="card-title text-dark fw-semibold">{challenge.title}</h5>
                  <p className="card-text text-muted small">{challenge.description}</p>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center">
                      <div className="d-flex me-2">
                        <div className="rounded-circle bg-secondary bg-opacity-25 text-dark border border-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: 12 }}>👤</div>
                        <div className="rounded-circle bg-secondary bg-opacity-25 text-dark border border-white d-flex align-items-center justify-content-center ms-n2" style={{ width: 24, height: 24, fontSize: 12 }}>👤</div>
                        <div className="rounded-circle bg-secondary bg-opacity-25 text-dark border border-white d-flex align-items-center justify-content-center ms-n2" style={{ width: 24, height: 24, fontSize: 12 }}>👤</div>
                      </div>
                      {challenge.playCount > 0 ? (
                        <small className="text-muted">{formatPlayCount(challenge.playCount)} played today</small>)
                        : (
                          <div>
                            <small className="text-muted">{challenge.players} played</small>
                          </div>
                        )
                        
                        }


                    </div>
                    <Button 
                      size="sm" 
                      className="btn-play btn-sm px-3 text-white bg-primary"
                      style={{
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "0.5rem",
                        border: "1px solid black",
                      }}
                    >
                      Play
                    </Button>
                  </div>
                  
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
