import React, { useEffect, useState } from 'react';
import { getQuestionById } from '../utils/apiFunctions';
import Swal from 'sweetalert2';  // Import SweetAlert2

const QuestionCard = () => {
  const [question, setQuestion] = useState(null); // Initialize as null instead of undefined
  const [loading, setLoading] = useState(true);  // For loading state
  const [error, setError] = useState(null);      // For error handling

  useEffect(() => {
    const fetchData = async () => {
      const quesId = "67827df719e6bb75a8a9a59d";
      try {
        const response = await getQuestionById(quesId);
        if (response && response.length > 0) {
          setQuestion(response[0]);
        } else {
          setError("No question found");
        }
      } catch (error) {
        setError("Failed to fetch question");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const checkAnswer = (option) => {
    if (option.isCorrect) {
      Swal.fire({
        title: 'Correct Answer!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        title: 'Wrong Answer!',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container ms-5">
      <div className="container d-flex justify-content-center ms-5">
        <div className="card w-100">
          <div className="card-header">
            <h4 className="text-center">{question?.text}</h4>
          </div>
          <div className="card-body">
            <ul>
              {question?.options.map((option, index) => {
                // Convert index to letter (A, B, C, etc.)
                const letter = String.fromCharCode(65 + index); // 65 is ASCII for 'A'
                return (
                  <button className="btn btn-outline-success w-100 mt-3 d-flex justify-content-start" style={{color: 'black'}} key={index} onClick={() => checkAnswer(option)}>
                    {letter}. {option.option}
                  </button>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
