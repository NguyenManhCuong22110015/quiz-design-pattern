import { API } from "../utils/apiFunctions";


export async function getDataByPrompt (prompt) {
    const response = await API.get("/api/chatbot/chat?prompt=" + prompt);
    return response.data;
}