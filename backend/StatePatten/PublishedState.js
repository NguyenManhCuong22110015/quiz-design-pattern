
// PublishedState.js

import { QuizState } from './BaseState.js';

export class PublishedState extends QuizState {
  archive() {
    this.quiz.status = 'archived';
    this.quiz.published = false;
    console.log("Quiz archived.");
  }
}
