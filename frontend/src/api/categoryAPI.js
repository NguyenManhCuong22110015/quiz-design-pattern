import { API } from "../utils/apiFunctions";


export async function getAll () {
    const response = await API.get("/api/categories/getAll");
    return response.data;
  }
  