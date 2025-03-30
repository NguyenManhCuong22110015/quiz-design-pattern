import { API } from "../utils/apiFunctions";

export async function updateField(data) {
    const response = await API.put("/api/users/update-field", data);
    return response.data;   
};

export async function getUserById(id) {
    const response = await API.get(`/api/users/${id}`);
    return response.data;
}