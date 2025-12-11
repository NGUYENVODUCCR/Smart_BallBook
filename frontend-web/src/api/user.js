import axios from "axios";

const API_URL = "https://smart-ballbook.onrender.com/api/users";

export const getUsers = () => axios.get(API_URL);

export const getUserById = (id) => axios.get(`${API_URL}/${id}`);

export const updateUser = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

export const deleteUser = (id) =>
  axios.delete(`${API_URL}/${id}`);

export const toggleActive = (id) =>
  axios.patch(`${API_URL}/${id}/toggle`);

export const createUser = (data) =>
  axios.post(API_URL, data);
