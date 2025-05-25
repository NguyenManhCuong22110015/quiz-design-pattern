class QuizSubject {
  constructor() {
    this.observers = [];
  }
  
  // Add an observer to the notification list
  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      console.log('Observer subscribed', this.observers.length);
    }
  }
  
  // Remove an observer from the notification list
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
    console.log('Observer unsubscribed', this.observers.length);
  }
  
  // Notify all observers when a state change occurs
  notify(data) {
    console.log('Notifying observers:', this.observers.length);
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }
}

// Create a singleton instance to be shared across the application
const quizScoreSubject = new QuizSubject();

export { quizScoreSubject };