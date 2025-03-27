import { API } from "../utils/apiFunctions";

export async function getCommentsByQuiz(userId) {
    const response = await API.get("api/quizzes/getByUserId?userId=" + userId);
    return response.data;
};

export async function addComment(userId) {
    const response = await API.get("api/quizzes/getByUserId?userId=" + userId);
    return response.data;
};