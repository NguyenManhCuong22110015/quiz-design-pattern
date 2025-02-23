
import { API } from "../utils/apiFunctions";


export async function getActiveRoom () {
  const response = await API.get("/api/rooms/active");
    return response.data;
};

export async function getRoomById (roomId) {
  const response = await API.get(`/api/rooms/getRoom/${roomId}`);
    return response.data;
};

export async function createRoom (data) {
  const response = await API.post("/api/rooms/create",data);
    return response.data;
};

export async function updateRoomName(data) {
  const response = await API.put("/api/rooms/updateRoomName",data);
    return response.data;
};


export async function checkAccessRoom(roomId){
  const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/check-access`);
  return response.json();
}
