// interface Strategy 
class SearchStrategy {
  async search(params) {
    throw new Error("Phải override phương thức này");
  }
}
