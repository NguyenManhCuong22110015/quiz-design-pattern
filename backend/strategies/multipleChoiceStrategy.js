// strategies/multipleChoiceStrategy.js

import QuestionStrategy from './baseStrategy.js';

class MultipleChoiceStrategy extends QuestionStrategy {
  grade(question, userAnswers) {
    const correctOptions = question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.option.trim().toLowerCase())
      .sort();

    const userSelected = (userAnswers || [])
      .map(opt => opt.trim().toLowerCase())
      .sort();

    const isCorrect = JSON.stringify(correctOptions) === JSON.stringify(userSelected);
    return {
      isCorrect,
      score: isCorrect ? question.score : 0,
      feedback: isCorrect ? 'Correct answer!' : 'Incorrect answer. Please try again.',
    }
  }
}
export default MultipleChoiceStrategy;


