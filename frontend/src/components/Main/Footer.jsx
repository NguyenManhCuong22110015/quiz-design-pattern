import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row row-cols-2 row-cols-md-4 g-4">
          <div>
            <h5 className="mb-3">BrainQuest</h5>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-secondary text-decoration-none">About Us</a></li>
              <li><a href="/careers" className="text-secondary text-decoration-none">Careers</a></li>
              <li><a href="/press" className="text-secondary text-decoration-none">Press</a></li>
              <li><a href="/blog" className="text-secondary text-decoration-none">Blog</a></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3">Games</h5>
            <ul className="list-unstyled">
              <li><a href="/games/memory" className="text-secondary text-decoration-none">Memory</a></li>
              <li><a href="/games/logic" className="text-secondary text-decoration-none">Logic</a></li>
              <li><a href="/games/math" className="text-secondary text-decoration-none">Math</a></li>
              <li><a href="/games/word" className="text-secondary text-decoration-none">Word</a></li>
              <li><a href="/games/focus" className="text-secondary text-decoration-none">Focus</a></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3">Support</h5>
            <ul className="list-unstyled">
              <li><a href="/faq" className="text-secondary text-decoration-none">FAQ</a></li>
              <li><a href="/contact" className="text-secondary text-decoration-none">Contact Us</a></li>
              <li><a href="/help" className="text-secondary text-decoration-none">Help Center</a></li>
              <li><a href="/community" className="text-secondary text-decoration-none">Community</a></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3">Legal</h5>
            <ul className="list-unstyled">
              <li><a href="/terms" className="text-secondary text-decoration-none">Terms of Service</a></li>
              <li><a href="/privacy" className="text-secondary text-decoration-none">Privacy Policy</a></li>
              <li><a href="/cookies" className="text-secondary text-decoration-none">Cookie Policy</a></li>
              <li><a href="/gdpr" className="text-secondary text-decoration-none">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-4 border-top border-secondary d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded me-2" style={{ width: 32, height: 32, fontWeight: 'bold' }}>
              BQ
            </div>
            <span className="h6 mb-0">BrainQuest</span>
          </div>

          <div className="d-flex gap-3">
            <a href="#" className="text-secondary text-decoration-none">
              <span className="visually-hidden">Facebook</span>
              <Facebook size={24} />
            </a>
            <a href="#" className="text-secondary text-decoration-none">
              <span className="visually-hidden">Twitter</span>
              <Twitter size={24} />
            </a>
            <a href="#" className="text-secondary text-decoration-none">
              <span className="visually-hidden">Instagram</span>
              <Instagram size={24} />
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-muted small">
          <p>© {new Date().getFullYear()} BrainQuest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
