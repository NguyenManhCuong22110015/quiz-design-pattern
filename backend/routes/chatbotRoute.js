import e, { Router } from 'express';
import { initChatBot } from '../services/generateQuizService.js';

const router = Router();

router.get('/chat', async (req, res) => {
  try {
    const {prompt} = req.query;
    
    const text = await initChatBot(prompt);
   
    res.json(text);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;