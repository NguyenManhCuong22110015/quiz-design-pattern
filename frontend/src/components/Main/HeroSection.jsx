import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAnimations } from "../../hooks/useAnimations";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function HeroSection() {
  const { fadeIn, slideIn, float } = useAnimations();

  return (
    <section className="pt-5 pb-5 bg-light">
      <div className="container">
        <div className="row align-items-center">
          {/* Hero Content */}
          <motion.div
            className="col-md-6 mb-4 mb-md-0"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="display-5 fw-bold text-dark mb-3">
              Train Your Brain in <span className="text-primary">5 Minutes</span> a Day
            </h1>
            <p className="lead text-secondary mb-4">
              Quick, challenging brain games designed to improve your cognitive abilities. Play anytime, anywhere, no installation required.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link to="/category" className="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2">
                Start Playing
                <ArrowRight size={20} />
              </Link>
              <Link to="/how-it-works" className="btn btn-outline-secondary btn-lg">
                How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="row mt-4 text-center">
              <div className="col-4">
                <p className="h3 text-primary mb-0 fw-bold">10M+</p>
                <small className="text-muted">Players</small>
              </div>
              <div className="col-4">
                <p className="h3 text-primary mb-0 fw-bold">500+</p>
                <small className="text-muted">Challenges</small>
              </div>
              <div className="col-4">
                <p className="h3 text-primary mb-0 fw-bold">12</p>
                <small className="text-muted">Brain Areas</small>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="col-md-6 position-relative"
            initial="hidden"
            animate="visible"
            variants={slideIn}
          >
            <div className="position-relative overflow-hidden rounded shadow">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="People playing brain games"
                className="img-fluid rounded transition-transform"
                style={{ transition: "transform 0.7s" }}
              />
              {/* Gradient overlay */}
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
                opacity: 0,
                transition: "opacity 0.3s"
              }}></div>

              {/* Floating Elements */}
              <motion.div
                className="position-absolute top-0 end-0 translate-middle bg-warning text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                style={{ width: 64, height: 64, top: "-1.5rem", right: "-1.5rem" }}
                variants={float}
                animate="animate"
              >
                🧠
              </motion.div>
              <motion.div
                className="position-absolute bottom-0 start-0 translate-middle bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                style={{ width: 56, height: 56, bottom: "-1.5rem", left: "-1.5rem" }}
                animate={{
                  scale: [1, 1.05, 1],
                  transition: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                  }
                }}
              >
                🎯
              </motion.div>
            </div>

            {/* Testimonial */}
            <motion.div
              className="position-absolute bottom-0 end-0 bg-white p-3 rounded shadow mt-3"
              style={{ maxWidth: "250px", right: "1rem", bottom: "1rem" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="d-flex gap-3 align-items-start">
                <div className="rounded-circle overflow-hidden" style={{ width: 40, height: 40 }}>
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
                    alt="User avatar"
                    className="img-fluid"
                  />
                </div>
                <div>
                  <p className="small text-muted mb-1">
                    Just 5 minutes a day improved my memory in two weeks!
                  </p>
                  <p className="small fw-semibold text-dark mb-0">Sarah T.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
