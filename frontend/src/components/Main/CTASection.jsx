import { Button } from "./../ui/button";
import { motion } from "framer-motion";
import { useAnimations } from "./../hooks/useAnimations";

export default function CTASection() {
  const { fadeIn, staggerContainer, fadeInUp } = useAnimations();

  return (
    <section className="py-5 text-white" style={{ background: "linear-gradient(to right, var(--bs-primary),rgb(213, 223, 97))" }}>
      <div className="container text-center">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="display-5 fw-bold mb-3">Ready to Train Your Brain?</h2>
          <p className="lead text-white-50 mb-4 mx-auto" style={{ maxWidth: 700 }}>
            Join millions of users who spend just 5 minutes a day improving their cognitive abilities.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 my-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg" className="px-4 py-3 bg-white text-primary fw-bold shadow">
            Get Started – It's Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-4 py-3 border border-white text-white fw-bold"
            style={{ backgroundColor: "transparent" }}
          >
            Learn More
          </Button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="row text-center mt-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { count: "10M+", label: "Active Users" },
            { count: "100+", label: "Brain Games" },
            { count: "15M+", label: "Daily Games Played" },
            { count: "190+", label: "Countries" }
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeInUp} className="col-6 col-md-3 mb-4">
              <p className="h2 fw-bold">{stat.count}</p>
              <p className="text-white-50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
