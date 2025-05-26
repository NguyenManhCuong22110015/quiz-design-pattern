import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
 

export async function generateContent(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
     const response = result.response;
    const text = await response.text();
    return text.trim();
}


export async function setQuiz(topics, questionTypes, numberOfQuestions, difficulty) {
    console.log("💡 Topics:", topics);
    console.log("🎨Question Types:", questionTypes);
    console.log("Number Of Questions:", numberOfQuestions);
    
    return {
        topics,
        questionTypes,
        numberOfQuestions,
        difficulty
    };
}
export async function describeWebsiteInfo(websiteType, mainFeatures, targetAudience, purpose) {
  // Tạo prompt để Gemini hiểu và trả về mô tả sáng tạo
  const prompt = `
Bạn là một trợ lý AI giúp viết mô tả hấp dẫn cho website.
Dựa trên thông tin sau, hãy tạo một đoạn mô tả sinh động, thu hút và tự nhiên cho website.
- Tên website: Quizz Online 
- Loại website: ${websiteType}
- Mục đích: ${purpose}
- Đối tượng người dùng: ${targetAudience || "Tất cả người dùng"}
- Các tính năng chính: ${mainFeatures.join(', ')}

Viết đoạn mô tả ngắn gọn, rõ ràng, sử dụng ngôn ngữ thân thiện và hấp dẫn.Có lời chảo mừng và khuyến khích người dùng khám phá website.
`;

  try {
    const text = await generateContent(prompt);

    return text.trim();
  } catch (error) {
    console.error("Lỗi khi gọi Gemini:", error);
    return null;
  }
}