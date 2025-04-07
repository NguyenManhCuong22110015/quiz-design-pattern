
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

export async function getAll () {
    const response = await API.get("/api/categories/getAll");
    return response.data;
}
  
export async function createCategory (data) {
  const response = await API.post("/api/categories/create", data);
  return response.data;
}
export async function updateCategory (id, data) {
  const response = await API.put("/api/categories/update/" + id, data);
  return response.data;
}
export async function deleteCategory (id) {
  const response = await API.delete("/api/categories/delete/" + id);
  return response.data;
}

