import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Quizze from '../models/Quizze.js';
import Question from '../models/Question.js';
import Category from '../models/Category.js';

dotenv.config();
const app = express();
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Map tên collection với model Mongoose tương ứng
const modelMap = {
  quizzes: Quizze,
  categories: Category,
  questions: Question
};

// Xử lý truy vấn
async function queryMongoDB(model, pipeline) {
  return await model.aggregate(pipeline);
}

// Route chính
export const queryData = async (query) => {
  const userQuery = query;
  const invalid = "``` json or```";
  try {
    const prompt = `
     Bạn là một trợ lý AI giúp tạo truy vấn MongoDB từ câu hỏi ngôn ngữ tự nhiên.
Cơ sở dữ liệu có các collection:

- quizzes: title (string), description (string), image (string), level (string), rating (number), createdAt (date), updatedAt (date), category (ObjectId)
- questions: quizId (ObjectId), type (string), text (string), options (array) gồm các option con có option (string) và isCorrect (boolean), layout (string), point (number), time (number), description (string), media (string), mediaType (string), createdAt (date)
- categories: name (string), description (string), createdAt (date)

Nếu người dùng hỏi về thông tin của quiz kèm theo câu hỏi trong quiz, hãy tạo pipeline với $lookup để lấy thêm câu hỏi từ collection questions 
và thêm một $lookup để lấy tên category từ collection categories (dựa vào field category trong quizzes).
      Dựa trên câu hỏi: "${userQuery}", hãy xác định collection phù hợp và tạo aggregation pipeline MongoDB để trả lời.
      Trả về một object JSON có 2 thuộc tính:
      {
        "collection": "tên_collection",
        "pipeline": [ array_pipeline ]
      }

      Return only raw JSON output without markdown, code fences, or explanation. Do not include ${invalid} or any extra text.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      return {
        success: false,
        error: '❌ Không thể parse JSON từ AI response',
        raw: responseText
      };
    }

    const { collection, pipeline } = parsed;
    const mongoModel = modelMap[collection];

    if (!mongoModel) {
      return {
        success: false,
        error: `❌ Collection "${collection}" không tồn tại`,
        collection
      };
    }

    const queryResult = await queryMongoDB(mongoModel, pipeline);

    if (!queryResult || queryResult.length === 0) {
      return {
        success: false,
        message: '❌ Không tìm thấy dữ liệu phù hợp với câu hỏi.',
        collection,
        pipeline,
        empty: true
      };
    }

    const formatPrompt = `
      Dựa trên kết quả truy vấn MongoDB: ${JSON.stringify(queryResult)},
      và câu hỏi: "${userQuery}", hãy trả lời bằng ngôn ngữ tự nhiên dễ hiểu.
    `;
    const formattedResult = await model.generateContent(formatPrompt);
    const answer = formattedResult.response.text();

    return {
      success: true,
      answer,
      rawResult: queryResult,
      collection,
      pipeline
    };

  } catch (error) {
    console.error('Lỗi:', error);
    return {
      success: false,
      error: '❌ Không thể xử lý câu hỏi',
      details: error.message
    };
  }
};

app.listen(3000, () => console.log('🚀 Server chạy tại http://localhost:3000'));
