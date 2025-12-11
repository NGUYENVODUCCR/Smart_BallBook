import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://192.168.1.139:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
