// strategies/singleAnswerStrategy.js

import QuestionStrategy from './baseStrategy.js';

class SingleAnswerStrategy extends QuestionStrategy {
  grade(question, userAnswer) {
    const correctOption = question.options.find(opt => opt.isCorrect);
    if (!correctOption) return 0;

    return{
      isCorrect: correctOption.option.trim().toLowerCase() === (userAnswer || '').trim().toLowerCase(),
      score: correctOption.option.trim().toLowerCase() === (userAnswer || '').trim().toLowerCase() ? question.score : 0,
      feedback: correctOption.option.trim().toLowerCase() === (userAnswer || '').trim().toLowerCase() ? 'Correct answer!' : 'Incorrect answer. Please try again.',
    }
  }
}

export default SingleAnswerStrategy;
