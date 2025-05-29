import MarkdownIt from 'markdown-it'; // npm install markdown-it
import e, { Router } from 'express';
import { initChatBot } from '../services/generateQuizService.js';
import { queryData } from '../services/NLQ.js';
import { generateContent } from '../services/functionCall.js';

const router = Router();
const md = new MarkdownIt();

// Custom renderer for mobile-friendly text
const mobileRenderer = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true
});

// Override renderers for mobile format
mobileRenderer.renderer.rules.strong_open = () => '🔹 ';
mobileRenderer.renderer.rules.strong_close = () => '';
mobileRenderer.renderer.rules.em_open = () => '• ';
mobileRenderer.renderer.rules.em_close = () => '';
mobileRenderer.renderer.rules.heading_open = (tokens, idx) => {
  const level = tokens[idx].tag.slice(1);
  return '🔸'.repeat(level) + ' ';
};
mobileRenderer.renderer.rules.heading_close = () => '\n';
mobileRenderer.renderer.rules.code_inline = (tokens, idx) => `[${tokens[idx].content}]`;

router.post('/chat', async (req, res) => {
  try {
    const prompt = req.body.query;
    
    let text = await initChatBot(prompt);
    
    if (!text) {
      const tryQuery = await queryData(prompt);
      text = tryQuery.answer;
    }
    if (!text) {
      text = "Xin lỗi, tôi không thể trả lời câu hỏi này.";
    }
    

    res.json(text);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/chatbot', async (req, res) => {
  try {
    const message = req.body.message;
    let prompt = message?.content;

    let text = await initChatBot(prompt);
    
    if (!text) {
      const tryQuery = await queryData(prompt);
      text = tryQuery?.answer;
    }
    
    if (!text) {
      text = await generateContent(prompt);
    }
    
    if (!text) {
      text = "❌ Xin lỗi, tôi không thể trả lời câu hỏi này.";
    }

    let botReply = {
      role: 'assistant',
      content: mobileRenderer.render(text) // Dùng markdown-it
    };

    res.json({ response: botReply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;