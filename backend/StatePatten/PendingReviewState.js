// StatePattern/PendingReviewState.js

import { QuizState } from './BaseState.js';

export class PendingReviewState extends QuizState {
  publish() {
    this.quiz.status = 'published';
    this.quiz.published = true;
    console.log("Quiz is now published.");
  }

  archive() {
    this.quiz.status = 'archived';
    console.log("Quiz archived from review.");
  }
}



