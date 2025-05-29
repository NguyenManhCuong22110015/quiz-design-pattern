// QuizContext.js
import { DraftState } from './DraftState.js';
import { PendingReviewState } from './PendingReviewState.js';
import { PublishedState } from './PublishedState.js';

export class QuizContext {
  constructor(quiz) {
    this.quiz = quiz;

    switch (quiz.status) {
      case 'pending_review':
        
        this.state = new PendingReviewState(quiz);
        break;
      case 'published':
        this.state = new PublishedState(quiz);
        break;
      case 'draft':
      default:
        this.state = new DraftState(quiz);
    }
  }

  requestReview() {
    this.state.requestReview();
  }

  publish() {
    this.state.publish();
  }

  archive() {
    this.state.archive();
  }
}


