import { API } from "../utils/apiFunctions";

export async function login (data) {
  const response = await API.post("/api/users/login", data);
  return response.data;
}

export async function signup (data) {
    const response = await API.post("/api/users/signup", data);
    return response.data;
}

export async function checkAuthLogin(token){
  const res = await API.get('/users/api/check-auth', {
    headers: { Authorization: `Bearer ${token}` }
});
  return res;
}
