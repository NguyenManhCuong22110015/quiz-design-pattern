import Quiz from '../models/Quizze.js';

export class SearchByTitleStrategy {
  async search(params) {
    const { keyword } = params;
    return Quiz.find({ title: { $regex: keyword, $options: 'i' } });
  }
}

export class SearchByCategoryStrategy {
  async search(params) {
    const { category } = params;
    return Quiz.find({ category });
  }
}

export class SearchByDifficultyStrategy {
  async search(params) {
    const { difficulty } = params;
    return Quiz.find({ difficulty });
  }
}

export class SearchByComplexStrategy {
  async search(params) {
    const { keyword, category, difficulty } = params;
    const query = {};
    if (keyword) query.title = { $regex: keyword, $options: 'i' };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    return Quiz.find(query);
  }
}
