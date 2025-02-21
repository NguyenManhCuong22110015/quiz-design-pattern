
import { API } from "../utils/apiFunctions";


export async function getActiveRoom () {
  const response = await API.get("/api/rooms/active");
    return response.data;
};
