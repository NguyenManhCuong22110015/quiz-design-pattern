
class QuizSearchContext {
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executeSearch(params) {
    if (!this.strategy) {
      throw new Error("Strategy chưa được set!");
    }
    return this.strategy.search(params);
  }
}
