
// StatePatten/DraftState.js

import { QuizState } from './BaseState.js';

export class DraftState extends QuizState {
  requestReview() {
    this.quiz.status = 'pending_review';
    console.log("Quiz is now in review.");
  }
}
