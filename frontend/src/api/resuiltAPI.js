
import { API } from "../utils/apiFunctions";


export async function initialResult (data) {
  const response = await API.post("/api/results/create", data);
    return response.data;
};


export async function checkProcess(data){
    const response = await API.post(`/api/results/check-process`, data);
    return response.data;
}

export async function addAnswerToResult(data){
    const response = await API.put(`/api/results/add-answer`, data);
    return response.data;   
}

export const completeResult = async (data) => {
    try {
      const response = await API.post(`/api/results/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing result:', error);
      throw error;
    }
  };


export  const getTopTenPlayers = async (quizId) => {
    try {
        const response = await API.get(`/api/results/top-ten-players?quizId=${quizId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching top ten players:', error);
        throw error;
    }
}