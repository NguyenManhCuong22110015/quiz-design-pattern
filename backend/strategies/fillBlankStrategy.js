// strategies/fillBlankStrategy.js

import QuestionStrategy from './baseStrategy.js';

class FillBlankStrategy extends QuestionStrategy {
  grade(question, userAnswer) {
    if (!Array.isArray(question.options) || !userAnswer) return 0;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();

    const correctOptions = question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.option.trim().toLowerCase());

    const isCorrect = correctOptions.includes(normalizedUserAnswer);
    return {
      isCorrect,
      score: isCorrect ? question.score : 0,
      feedback: isCorrect ? 'Correct answer!' : 'Incorrect answer. Please try again.',
    }
  }
}
export default FillBlankStrategy;

