import  { Router } from 'express';
import { initializeResult, checkProcess , addAnswerToResult, getTopTenPlayers, submitAnswer, getResultByUserId} from '../controllers/resultController.js';
const router = Router();

router.post('/create', initializeResult );

router.post('/check-process', checkProcess);

router.put('/add-answer', addAnswerToResult);

router.get("/top-ten-players", getTopTenPlayers);

router.post('/submit-answer',submitAnswer )


router.get('/getResultByUserId/:userId', getResultByUserId);



export default router;