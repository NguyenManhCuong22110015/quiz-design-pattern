import { API } from "../utils/apiFunctions";



export async function uploadImage(data) {
  const response = await API.post("api/media/upload-image", data);
  return response.data;
}

export async function uploadAudio(data) {
  const response = await API.post("api/media/upload-audio", data);
  return response.data;
}


export async function uploadVideo(data) {
  const response = await API.post("api/media/upload-video", data);
  return response.data;
}




export async function uploadMedia(data) {
const response = await API.post("api/media/upload", data);
  return response.data;
}