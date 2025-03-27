import { API } from "../utils/apiFunctions";

export async function getTopPlayers(userId) {
    const response = await API.get("api/quizzes/getByUserId?userId=" + userId);
    return response.data;
};