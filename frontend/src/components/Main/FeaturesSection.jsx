import { motion } from "framer-motion";
import { useAnimations } from "./../hooks/useAnimations";
import {
  Clock,
  Clipboard,
  BarChart3,
  Users,
  Zap,
  BookOpen
} from "lucide-react";

export default function FeaturesSection() {
  const { staggerContainer, featureItem } = useAnimations();

  const features = [
    {
      icon: <Clock className="text-primary" size={28} />,
      title: "5-Minute Challenges",
      description: "Quick brain games that fit into your coffee break, commute, or anytime you have a few minutes.",
      bgColor: "bg-light text-primary"
    },
    {
      icon: <Clipboard className="text-warning" size={28} />,
      title: "Varied Categories",
      description: "From memory and logic to math and verbal skills, find challenges that target different cognitive abilities.",
      bgColor: "bg-warning bg-opacity-25"
    },
    {
      icon: <BarChart3 className="text-success" size={28} />,
      title: "Track Your Progress",
      description: "See your performance improve over time with detailed stats and insights about your cognitive development.",
      bgColor: "bg-success bg-opacity-25"
    },
    {
      icon: <Users className="text-primary" size={28} />,
      title: "Compete with Friends",
      description: "Challenge friends to the same games and compare scores to add a fun, social element to brain training.",
      bgColor: "bg-primary bg-opacity-25"
    },
    {
      icon: <Zap className="text-danger" size={28} />,
      title: "Adaptive Difficulty",
      description: "Our challenges adjust to your skill level, ensuring you're always appropriately challenged as you improve.",
      bgColor: "bg-danger bg-opacity-25"
    },
    {
      icon: <BookOpen className="text-purple" size={28} />,
      title: "Backed by Science",
      description: "Our exercises are developed with neuroscientists to ensure they effectively target key cognitive functions.",
      bgColor: "bg-purple bg-opacity-25"
    }
  ];

  return (
    <section id="features" className="py-5 bg-white">
      <div className="container">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="h2 fw-bold text-dark mb-3">Brain Training That Fits Your Life</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: 600 }}>
            Our quick, science-backed challenges are designed to fit into your busy schedule.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="row gy-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="col-12 col-md-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                variants={featureItem}
                className="card h-100 shadow-sm border-0 transition"
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className={`card-body position-relative rounded p-4 ${feature.bgColor}`}>
                  <div className="d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                    {feature.icon}
                  </div>
                  <h5 className="card-title fw-semibold">{feature.title}</h5>
                  <p className="card-text text-muted">{feature.description}</p>

                  {/* Hover layer simulation */}
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-0 rounded" style={{ zIndex: 0 }}></div>
                  <div className="position-absolute bottom-0 end-0 rounded-circle bg-primary opacity-0" style={{ width: 64, height: 64, filter: "blur(30px)" }}></div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
