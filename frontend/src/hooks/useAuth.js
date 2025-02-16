import { useState, useEffect } from "react";
import axios from "axios";

const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/api/auth/me");
        setUser(data);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return user;
};

export default useAuth;
