import 'dotenv/config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khai báo function describeWebsite
const describeWebsiteDeclaration = {
  name: 'describeWebsite',
  description: 'Mô tả website dựa trên URL',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Địa chỉ URL của website cần mô tả',
      },
    },
    required: ['url'],
  },
};

// Tạo instance GoogleGenerativeAI với API key
const genAI = new GoogleGenerativeAI('AIzaSyDlm3D6a-4XZ2UWPU1NPnCCxo4WiybNyXU');

// Lấy model generative với function declaration
const generativeModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [
    {
      functionDeclarations: [describeWebsiteDeclaration],
    },
  ],
});

// Hàm mô phỏng xử lý function call describeWebsite
async function describeWebsite({ url }) {
  // Ở đây bạn có thể gọi API thực hoặc trả về mô tả mẫu
  return {
    websiteType: "Technology",
    mainFeatures: ["AI research", "Products", "Blog"],
    purpose: `Trang web cung cấp thông tin và dịch vụ AI: ${url}`,
  };
}

// Hàm test đơn giản
async function test() {
  try {
    const chat = await generativeModel.startChat();

    const prompt = "Describe website https://openai.com";

    // Gửi prompt đến model
    const result = await chat.sendMessage(prompt);
    console.log("Result trả về từ model:", result);

    // Lấy function call nếu có
   const call = result.response.functionCalls()?.[0];

if (call) {
  console.log("Function call detected:", call.name);

  // Nếu call.args là string thì parse, nếu là object thì dùng luôn
  const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;

  const response = await describeWebsite(args);

  console.log("Function response:", response);
} else {
  console.log("No function call detected");
}

  } catch (err) {
    console.error("Error:", err);
  }
}

test();
