import axios from 'axios'
const apiUrl = import.meta.env.VITE_BACKEND_API;
export const API = axios.create({
    baseURL : apiUrl
})

export async function listUsers(){
    const response = await API.get("/api/users")
   return response.data
}
export async function getQuestionById(qsId){
    const response = await API.get(`/api/questions/byId?quesId=${qsId}`);
    return response.data
}