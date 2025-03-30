import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/ChoiceTypeCard.css';
import { Link } from 'react-router-dom';


export default function QuizApp() {
  return (
    <div className="container py-4 choice-type-card">
     

     
      <section className="quiz-section d-flex justify-content-between mt-4">
        <div className="quiz-card d-flex align-items-center card-3d">
          <img src="https://res.cloudinary.com/dj9r2qksh/image/upload/v1742653932/t%E1%BA%A3i_xu%E1%BB%91ng_3_zvawkz.png" alt="Cartoon character writing a quiz" />
          <div className="content d-flex flex-column align-items-center text-center ">
            <h2>Create a quiz</h2>
            <p>Play for free with 300 participants</p>
            <Link to="/admin/quizz" className="btn btn-success glow-on-hover btn-press">
              Quiz editors <i className="fas fa-edit ms-1"></i>
            </Link>
          </div>
        </div>
        <div className="quiz-card d-flex align-items-center">
          <img src="https://res.cloudinary.com/dj9r2qksh/image/upload/v1742653847/t%E1%BA%A3i_xu%E1%BB%91ng_8_z5se6b.jpg" alt="Cartoon character pointing" />
          <div className="content d-flex flex-column align-items-center text-center">
            <h2>A.I.</h2>
            <p>Generate a quiz from any subject or pdf</p>
            <Link  to="/generate" className="btn btn-info text-dark">Quiz generator</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
