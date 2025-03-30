import { API } from "../utils/apiFunctions";


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
