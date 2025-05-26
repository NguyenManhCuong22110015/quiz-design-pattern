
// service/gradeService.js

import MultipleChoiceStrategy from '../strategies/multipleChoiceStrategy.js';
import FillBlankStrategy from '../strategies/fillBlankStrategy.js';
import SingleAnswerStrategy from '../strategies/singleAnswerStrategy.js';

const strategyMap = {
  'MULTIPLE_ANSWER': new MultipleChoiceStrategy(),
  'FILL_BLANK': new FillBlankStrategy(),
  'SINGLE_ANSWER': new SingleAnswerStrategy(),
  'TRUE_FALSE': new SingleAnswerStrategy(),
};

export function gradeQuestion(question, userAnswer) {
  const strategy = strategyMap[question.type] || new SingleAnswerStrategy(); 
  return strategy.grade(question, userAnswer);
}
