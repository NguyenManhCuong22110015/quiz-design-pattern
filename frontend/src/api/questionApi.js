
import { API } from "../utils/apiFunctions";
export const getAllQuestions = async () => {
  const { data } = await API.post("/api/users/register");
  return data;
};


export const getQuestionsByQuizzId = async (quizzId) => {
  const { data } = await API.get(`/api/questions/getQuestionsByQuizzId?quizId=${quizzId}`);
  return data;
};

