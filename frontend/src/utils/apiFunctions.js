import axios from 'axios'

export const API = axios.create({
    baseURL : "http://localhost:5000"
})

export async function listUsers(){
    const response = await API.get("/api/users")
   return response.data
}
export async function getQuestionById(qsId){
    const response = await API.get(`/api/questions/byId?quesId=${qsId}`);
    return response.data
}