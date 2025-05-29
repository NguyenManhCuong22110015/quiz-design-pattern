import Question from '../models/Question.js'; 
import Result from '../models/Result.js';
import multer from 'multer';
import Quizze from '../models/Quizze.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { QuizContext } from '../StatePatten/QuizContext.js';
import { SearchByTitleStrategy, SearchByCategoryStrategy, SearchByDifficultyStrategy, SearchByComplexStrategy } from '../Strategy/quizSearchStrategies.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import {cloudinary} from '../config/cloudinary.js';
import {generateQuiz} from "../services/generateQuizService.js"


export const getAllQuestions = async (req, res) => {
    try {
            const quizId = req.body.quizId; 
            const questions = await Question.find({ quizId: quizId });
            res.json(questions);
    } catch (error) {
            res.status(500).json({ message: error.message });
    }
}

export const getByUserId = async (req, res) => {
        try {
            const { userId } = req.query;
            
            const quizze = await Quizze.find({ createdBy: userId }); 
            res.json(quizze);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
}
    
export const getById = async (req, res) => {
        try {
            const { id } = req.query;   
            const quizze = await Quizze.find({ _id: id }).findOne(); 
            res.json(quizze);
          } catch (error) {
            res.status(500).json({ message: error.message });
        }

}
export const getDetailById = async (req, res) => {
  try {
      const { id } = req.query;   
      const quizze = await Quizze.find({ _id: id }).findOne(); 
      const questionNumber = await Question.countDocuments({ quizId: id });
      const players = await Result.countDocuments({ quiz: id }).populate('user');
      const author = await User.findById(quizze.createdBy).select('name');
      const categoryName = await Category.findById(quizze.category).select('name');
      const data = {
          quizze: quizze,
          questionNumber: questionNumber,
          players: players,
          author: author ? author.name : 'Unknown Author',
          categoryName: categoryName ? categoryName.name : 'Uncategorized'
      }
      console.log(data)

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
  }

}

export const getChallengesQuizzes = async (req, res) => {
        try {
          const quizz = await Quizze.find({rating: { $gt: 0 }}).limit(4).sort({ rating: -1 });
          
          const challenges = await Promise.all(
            quizz.map(async (quiz) => {
              const questionNumber = await Question.countDocuments({ quizId: quiz._id });
              const players = await Result.countDocuments({ quiz: quiz._id }).populate('user');
              
              return {
                ...quiz._doc,
                questionNumber: questionNumber,
                players: players
              };
            })
          );


          res.status(200).json(challenges);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
}
export const getAll = async (req, res) => {
        try {
            const { userId } = req.query;
            const quizze = await Quizze.find({ 
              createdBy: { $ne: userId } 
            }); 
           
            res.json(quizze);
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
}

export const getByCategory = async (req, res) => {
        try {
        
            const category = req.query.category;
            const quizze = await Quizze.find({ category: category });
            res.json(quizze);
          }
          catch (error) {
            res.status(500).json({ message: error.message });
          }
        
}


export const createQuizze = async (req, res) => {
        const { title, description, category, level, createdBy, imageUrl } = req.body;
        
        
          const categoryId = await getIdByName(category) 
          
          try {
            const quizze = new Quizze({
              title:title,
              description:description,
              category:categoryId,
              image: imageUrl || '', 
              level:level,
              createdBy:createdBy,
            });
            
            const newQuizze = await quizze.save();
            res.status(201).json(newQuizze);
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
}


export const  deleteImage = async (req, res) => {
        try {
            const { publicId } = req.params;
            
            const result = await cloudinary.uploader.destroy(publicId);
            
            if (result.result === 'ok') {
              return res.json({ message: 'Image deleted successfully' });
            } else {
              return res.status(400).json({ message: 'Failed to delete image' });
            }
          } catch (error) {
            console.error("Error deleting image:", error);
            res.status(500).json({ message: error.message });
          }
}

export const updateQuizze = async (req, res) => {
        const { title, description, category, level, image } = req.body;
        ;
          const { id } = req.params;
          try {
            const quizze = await Quizze.findById(id); 
            if (title) quizze.title = title;
            if (description) quizze.description = description;
            if (category) quizze.category = category;
            if (level) quizze.level = level;
            if (image) quizze.image = image;
            quizze.updatedAt = new Date();
            const updatedQuizze = await quizze.save();
            res.json(updatedQuizze);
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
}

export const generateQuizze = async (req, res) => {
         try {
            const prompt = req.body.prompt;
            const quizData = await generateQuiz(prompt);
            
            res.json({
              questions: quizData.questions || [],
              topicImage: quizData.topicImage || null
            });
          } catch (error) {
            console.error("Error generating quiz:", error);
            res.status(500).json({ message: error.message });
          }
}

export const searchQuizze = async (req, res) => {
  const { type, keyword, category, difficulty } = req.query;

  const context = new QuizSearchContext();

  switch(type) {
    case 'title':
      context.setStrategy(new SearchByTitleStrategy());
      break;
    case 'category':
      context.setStrategy(new SearchByCategoryStrategy());
      break;
    case 'difficulty':
      context.setStrategy(new SearchByDifficultyStrategy());
      break;
    case 'complex':
      context.setStrategy(new SearchByComplexStrategy());
      break;
    default:
      return res.status(400).json({ error: "Loại tìm kiếm không hợp lệ" });
  }

  try {
    const results = await context.executeSearch({ keyword, category, difficulty });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export const updateQuizStatus = async (req, res) => {
  try {
    const quiz = await Quizze.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    console.log("Received action:", req.body.action);
    console.log("Quiz before update:", quiz);

    // Sử dụng QuizContext 
    const quizContext = new QuizContext(quiz);

    switch(req.body.action) {
      case 'review':
      case 'requestReview':
      case 'pending_review':
        quizContext.requestReview();
        break;
      case 'publish':
      case 'published':
        quizContext.publish();
        break;
      case 'archive':
      case 'archived':
        quizContext.archive();
        break;
      case 'draft':
        
        quiz.status = 'draft';
        quiz.published = false;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action. Valid actions: draft, pending_review, published, archived' });
    }

    const updatedQuiz = await quiz.save();
    console.log("Quiz after update:", updatedQuiz);
    
    res.json(updatedQuiz);
  } catch (error) {
    console.error("Error in updateQuizStatus:", error);
    res.status(400).json({ message: error.message });
  }
}