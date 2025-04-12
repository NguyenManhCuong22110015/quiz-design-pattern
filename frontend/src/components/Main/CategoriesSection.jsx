import { motion } from "framer-motion";
import { useAnimations } from "../hooks/useAnimations";

export default function CategoriesSection({ categories = [] }) {
  const { staggerContainer, fadeInUp } = useAnimations();

  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: "Memory", icon: "🧩", gamesCount: 28, color: "bg-light text-dark", hoverColor: "rgba(103, 58, 183, 0.15)" },
    { id: 2, name: "Math", icon: "🔢", gamesCount: 32, color: "bg-warning bg-opacity-10 text-dark", hoverColor: "rgba(255, 193, 7, 0.2)" },
    { id: 3, name: "Verbal", icon: "🔤", gamesCount: 25, color: "bg-success bg-opacity-10 text-dark", hoverColor: "rgba(40, 167, 69, 0.15)" },
    { id: 4, name: "Logic", icon: "🧠", gamesCount: 30, color: "bg-info bg-opacity-10 text-dark", hoverColor: "rgba(23, 162, 184, 0.15)" },
    { id: 5, name: "Perception", icon: "👁️", gamesCount: 22, color: "bg-primary bg-opacity-10 text-dark", hoverColor: "rgba(13, 110, 253, 0.15)" },
    { id: 6, name: "Speed", icon: "⚡", gamesCount: 18, color: "bg-danger bg-opacity-10 text-dark", hoverColor: "rgba(220, 53, 69, 0.15)" },
  ];

  const iconBgColors = {
    "🧩": "bg-indigo-100",
    "🔢": "bg-warning",
    "🔤": "bg-success",
    "🧠": "bg-info",
    "👁️": "bg-primary",
    "⚡": "bg-danger"
  };

  return (
    <section id="categories" className="py-5 bg-white">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="fw-bold display-6 text-dark mb-3">Train Different Brain Areas</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
            Each category focuses on specific cognitive skills. For best results, practice across multiple areas.
          </p>
        </motion.div>

        <motion.div
          className="row g-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {displayCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
              className="col-6 col-sm-4 col-lg-2"
            >
              <div
                className={`category-card position-relative text-center rounded-4 p-3 ${category.color} shadow-sm h-100`}
                style={{ 
                  cursor: "pointer", 
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  overflow: "hidden"
                }}
              >
                <div
                  className={`category-icon rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${iconBgColors[category.icon] || "bg-light"}`}
                  style={{ 
                    width: "64px", 
                    height: "64px", 
                    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
                    position: "relative",
                    zIndex: 2
                  }}
                >
                  <span className="category-emoji" style={{ fontSize: "1.5rem", transition: "transform 0.3s ease" }}>{category.icon}</span>
                </div>
                <h5 className="fw-semibold text-dark mb-1" style={{ position: "relative", zIndex: 2 }}>{category.name}</h5>
                <p className="text-muted small" style={{ position: "relative", zIndex: 2 }}>{category.gamesCount} games</p>

                {/* Background effect element */}
                <div
                  className="category-bg-effect position-absolute"
                  style={{
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at center, ${category.hoverColor || 'rgba(var(--bs-primary-rgb), 0.15)'} 0%, transparent 70%)`,
                    opacity: 0,
                    transform: "scale(0.7)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    zIndex: 1
                  }}
                />
                
                {/* Border glow effect */}
                <div
                  className="category-border-effect position-absolute"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "1rem",
                    boxShadow: `0 0 0 2px ${category.hoverColor || 'rgba(var(--bs-primary-rgb), 0.2)'}`,
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    zIndex: 1
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

     
    </section>
  );
}
