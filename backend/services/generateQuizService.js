import 'dotenv/config.js'; 
import {generateQuizGroqToJSON, extractTextFromPDF, generateQuizFromText} from "../config/generateQuiz.js"; 
import {GoogleGenerativeAI} from "@google/generative-ai"
import {createQuizFunctionDeclaration, 
        describeWebsiteDeclaration} from "./functionDeclaration.js";
import {setQuiz, describeWebsiteInfo} from "./functionCall.js";


const genAI = new GoogleGenerativeAI(process.env.API);


  const generativeModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    tools: [
      {
        functionDeclarations: [createQuizFunctionDeclaration,
                              describeWebsiteDeclaration
        ],
      },
    ],
  });
  
  

  const functions = {
    createQuiz: ({ topics, questionTypes, numberOfQuestions, difficulty }) => {
      return setQuiz(topics, questionTypes, numberOfQuestions, difficulty);
    },
    describeWebsite: ({ websiteType, mainFeatures, purpose }) => {
      return describeWebsiteInfo("Quiz online", 
        ["Tạo quiz","Chơi quiz", "Quản lý tài khoản", "Tìm kiếm quiz",  "Tạo Room và chơi quiz trong room"],
        "Toàn bộ người dùng có như cầu", purpose="Giúp người dùng tạo quiz và chơi quiz",);
    },
  };
  
  export async function generateQuiz(prompt) {
    try {
      const chat = await generativeModel.startChat();
      
      const result = await chat.sendMessage(prompt);

      const call = result.response.functionCalls()?.[0];

      if (call) {
        console.log("✅ Nhận function call từ Gemini:", call.name);
        
        const apiResponse = await functions[call.name](call.args);
        console.log("🔹 Gọi Groq API để tạo quiz...");
        
        return generateQuizGroqToJSON(apiResponse.topics, apiResponse.questionTypes, apiResponse.numberOfQuestions, apiResponse.difficulty);
      } else {
        console.log("❌ Không có function call nào được tạo!");
        
        return generateQuizGroqToJSON(
          ["General Knowledge"], 
          ["Multiple choices"], 
          5, 
          "trung bình"
        );
      }
    } catch (error) {
      console.error("❌ Lỗi trong quá trình tạo quiz:", error);
      // Trả về mảng rỗng thay vì null
      return [];
    }
  }

  export async function initChatBot(prompt) {
    try {
      const chat = await generativeModel.startChat();
      
      const result = await chat.sendMessage(prompt);

      const call = result.response.functionCalls()?.[0];

      if (call) {
         
        const apiResponse = await functions[call.name](call.args);
        return apiResponse;
      } else {
        console.log("❌ Không có function call nào được tạo!");
       
      }
    } catch (error) {
      console.error("❌ Lỗi trong quá trình tạo quiz:", error);
      // Trả về mảng rỗng thay vì null
      return [];
    }
  }


  
  export async function generateQuizFromPDF(pdf) {
    try {
      console.log("🔹 Xử lý file PDF...");
      
      if (!pdf || !Buffer.isBuffer(pdf)) {
        console.error("❌ Buffer PDF không hợp lệ");
        return generateFallbackQuestions();
      }
      
      console.log(`📄 Kích thước buffer PDF: ${pdf.length} bytes`);
      
      // Trích xuất text từ PDF
      let text = await extractTextFromPDF(pdf);
      
      if (typeof text !== 'string' || text.length < 50 || 
          text.includes("Unable to extract") || 
          text.includes("Error processing PDF")) {
        console.warn("⚠️ Không thể trích xuất text hợp lệ từ PDF");
        return generateFallbackQuestions();
      }
      
      console.log(`📝 Đã trích xuất ${text.length} ký tự từ PDF`);
      
      // Tạo quiz từ text
      console.log("🔹 Tạo quiz từ văn bản...");
      const res = await generateQuizFromText(text);
      
      if (!res || !Array.isArray(res) || res.length === 0) {
        console.warn("⚠️ Không nhận được câu hỏi hợp lệ từ generateQuizFromText");
        return generateFallbackQuestions();
      }
      
      console.log(`✅ Đã tạo ${res.length} câu hỏi từ PDF`);
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi tạo quiz từ PDF:", error);
      return generateFallbackQuestions();
    }
  }
  
  // Định nghĩa hàm generateFallbackQuestions nếu chưa có
  function generateFallbackQuestions() {
    return [
      {
        question: "Không thể xử lý file PDF. Đây là câu hỏi mẫu thay thế.",
        type: "Multiple choices",
        difficulty: "trung bình",
        choices: [
          { text: "PDF không hợp lệ", isCorrect: false },
          { text: "Định dạng file không được hỗ trợ", isCorrect: true },
          { text: "File quá lớn", isCorrect: false },
          { text: "File đã bị mã hóa", isCorrect: false }
        ],
        explanation: "Đây là câu hỏi mẫu do không thể xử lý file PDF."
      },
      {
        question: "Bạn có thể thử lại với file PDF khác không?",
        type: "Multiple choices",
        difficulty: "dễ",
        choices: [
          { text: "Có, tôi sẽ thử file khác", isCorrect: true },
          { text: "Không, tôi không có file khác", isCorrect: false },
          { text: "Tôi sẽ thử chuyển đổi file trước", isCorrect: false },
          { text: "Tôi muốn tạo quiz theo cách khác", isCorrect: false }
        ],
        explanation: "Thử lại với file PDF khác có thể giải quyết vấn đề."
      }
    ];
  }

