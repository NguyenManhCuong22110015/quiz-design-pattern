
import { API } from "../utils/apiFunctions";
export const getAllQuestions = async () => {
  const { data } = await API.post("/api/users/register");
  return data;
};

export const getQuestionById = async (questionId) => {
  const { data } = await API.get(`/api/questions/byId?quesId=${questionId}`);
  return data;
}

export const getQuestionsByQuizzId = async (quizId) => {
  const { data } = await API.get(`/api/questions/getQuestionsByQuizzId?quizId=${quizId}`);
  return data;
};


export const saveQuestion = async (question) => {
  const { data } = await API.post(`/api/questions/create`, question);
  return data;
}

export const deleteQuestion = async (questionId) => {
  const { data } = await API.delete(`/api/questions/delete?quesId=${questionId}`);
  return data;
}


export const updateQuestion = async (question) => {
  const { data } = await API.put(`/api/questions/update`, question);
  return data;
}