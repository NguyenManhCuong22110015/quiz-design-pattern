import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/ChoiceTypeCard.css';
import { Link } from 'react-router-dom';


export default function QuizApp() {
  return (
    <div className="container py-4 choice-type-card">
     

     
      <section className="quiz-section d-flex justify-content-between mt-4">
        <div className="quiz-card d-flex align-items-center">
          <img src="https://placehold.co/200x150/png?text=Quiz+Image" alt="Cartoon character writing a quiz" />
          <div className="content d-flex flex-column align-items-center text-center">
            <h2>Create a quiz</h2>
            <p>Play for free with 300 participants</p>
            <Link to="/admin/quizz" className="btn btn-success">Quiz editors</Link>
          </div>
        </div>
        <div className="quiz-card d-flex align-items-center">
          <img src="https://placehold.co/200x150/png?text=AI+Image" alt="Cartoon character pointing" />
          <div className="content d-flex flex-column align-items-center text-center">
            <h2>A.I.</h2>
            <p>Generate a quiz from any subject or pdf</p>
            <Link className="btn btn-info text-dark">Quiz generator</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
