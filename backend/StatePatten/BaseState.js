// State Pattern Base Class for Quiz States

export class QuizState {
  constructor(quiz) {
    this.quiz = quiz;
  }

  publish() {
    throw new Error("Not allowed in current state");
  }

  archive() {
    throw new Error("Not allowed in current state");
  }

  requestReview() {
    throw new Error("Not allowed in current state");
  }
}
