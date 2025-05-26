import e, { Router } from 'express';
import { initChatBot } from '../services/generateQuizService.js';
import { queryData } from '../services/NLQ.js';
import { content } from 'googleapis/build/src/apis/content/index.js';
import { generateContent } from '../services/functionCall.js';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const prompt = req.body.query;
    
    let text = await initChatBot(prompt);
    
    if (!text) {
      const tryQuery = await queryData(prompt);
      text = tryQuery.answer;
    }

    res.json(text);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/chatbot', async (req, res) => {
  try {
    const message = req.body.message;

    let prompt = message.content;

  let text = await initChatBot(prompt);
    
    if (!text) {
      const tryQuery = await queryData(prompt);
      text = tryQuery.answer;
    }

    // xử lý lastMessage để trả về phản hồi
    let botReply = {
      role: 'assistant',
      content: text
    };

    if (!botReply.content) {

      const content = await generateContent(prompt);
      if (content) {
        botReply = {
          role: 'assistant',
          content: content
        };
      } else {
      botReply = {
      role: 'assistant',
      content: "Xin lỗi, tôi không thể trả lời câu hỏi này."
      }
    };
    }

    res.json({ response: botReply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




export default router;