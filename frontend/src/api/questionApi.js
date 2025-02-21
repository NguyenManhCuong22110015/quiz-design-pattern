import axios from "axios";

export const getAllQuestions = async () => {
  const { data } = await axios.post("/api/users/register");
  return data;
};

