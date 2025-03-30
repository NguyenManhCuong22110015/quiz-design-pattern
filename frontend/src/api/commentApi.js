import { API } from "../utils/apiFunctions";

export async function getCommentsByQuiz(quizId) {
    const response = await API.get("api/comments/getByQuizzId?quizId=" + quizId);
    return response.data;
};

export async function addComment(data) {
    const response = await API.post("api/comments/create", data);
    return response.data;
};