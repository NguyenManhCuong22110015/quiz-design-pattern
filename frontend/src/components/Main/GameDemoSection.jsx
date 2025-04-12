import { motion } from "framer-motion";
import { useAnimations } from "../hooks/useAnimations";
import { Zap, ArrowLeft, Volume2, MoreHorizontal, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

export default function GameDemoSection() {
  const { fadeIn, slideIn } = useAnimations();
  const [activeTiles, setActiveTiles] = useState([3, 5, 8, 14]);
  const [highlightedTile, setHighlightedTile] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTileIndex = Math.floor(Math.random() * 16);
      setHighlightedTile(randomTileIndex);
      setTimeout(() => setHighlightedTile(null), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isTileActive = (index) => activeTiles.includes(index);
  const isTileHighlighted = (index) => index === highlightedTile;

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Game Preview */}
          <motion.div
            className="col-lg-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideIn}
          >
            <div className="bg-white rounded-4 shadow p-4">
              <div className="ratio ratio-16x9 bg-secondary bg-opacity-10 rounded-3 position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <h3 className="h5 fw-bold text-dark mb-3">Memory Matrix</h3>
                  <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)", maxWidth: "260px" }}>
                    {Array.from({ length: 16 }).map((_, index) => (
                      <motion.div
                        key={index}
                        className={`rounded shadow-sm border transition ${
                          isTileActive(index)
                            ? "bg-primary"
                            : isTileHighlighted(index)
                            ? "bg-primary bg-opacity-50"
                            : "bg-primary bg-opacity-25"
                        }`}
                        style={{ width: "48px", height: "48px", cursor: "pointer" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isTileHighlighted(index) ? { scale: [1, 1.1, 1] } : {}}
                      />
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button className="btn btn-primary px-4 py-2 fw-medium">
                      Try This Game
                    </Button>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <p className="small text-muted mb-1">Level: <span className="fw-semibold text-dark">3 of 10</span></p>
                  <div className="progress" style={{ width: "200px", height: "6px" }}>
                    <div className="progress-bar bg-primary" style={{ width: "30%" }} />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-light btn-sm rounded-circle">
                    <Volume2 className="text-secondary" size={16} />
                  </button>
                  <button className="btn btn-light rounded-circle">
                    <ArrowLeft className="text-dark" size={20} />
                  </button>
                  <button className="btn btn-light btn-sm rounded-circle">
                    <MoreHorizontal className="text-secondary" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            className="col-lg-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="display-6 fw-bold text-dark mb-3">Experience Our Games</h2>
            <p className="text-muted lead mb-4">
              Our brain training games are designed to be both fun and effective. Each game targets specific cognitive skills while providing an engaging experience.
            </p>

            <div className="d-flex flex-column gap-4">
              <div className="d-flex">
                <div className="rounded-circle bg-info bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                  <Zap className="text-primary" />
                </div>
                <div className="ms-3">
                  <h5 className="fw-semibold text-dark mb-1">Scientifically Designed</h5>
                  <p className="text-muted small">Each game is carefully designed based on neuroscience research to effectively target specific cognitive functions.</p>
                </div>
              </div>

              <div className="d-flex">
                <div className="rounded-circle bg-warning bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                  <ArrowLeft className="text-warning" />
                </div>
                <div className="ms-3">
                  <h5 className="fw-semibold text-dark mb-1">Progressive Difficulty</h5>
                  <p className="text-muted small">Games adapt to your skill level, gradually increasing in difficulty as you improve to provide the right level of challenge.</p>
                </div>
              </div>

              <div className="d-flex">
                <div className="rounded-circle bg-success bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                  <Check className="text-success" />
                </div>
                <div className="ms-3">
                  <h5 className="fw-semibold text-dark mb-1">Immediate Feedback</h5>
                  <p className="text-muted small">Get instant feedback on your performance with detailed stats and insights to help you track your progress over time.</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button className="btn btn-primary btn-lg d-flex align-items-center">
                Explore All Games
                <ArrowLeft className="ms-2" style={{ transform: "rotate(180deg)" }} />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
