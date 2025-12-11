import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
//
export const getAllFields = async (token) => {
  const res = await axios.get(`${API}/fields`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.fields || res.data;
};
export const searchFieldByAI = async (keyword, token) => {
  const res = await axios.get(`${API}/search?q=${keyword}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.results || [];
};

export const resetField = async (id, token) => {
  const res = await axios.patch(
    `${API}/fields/${id}/reset`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getFieldById = async (id, token) => {
  const res = await axios.get(`${API}/fields/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.field || res.data;
};

export const createField = async (field, token) => {
  const res = await axios.post(`${API}/fields`, field, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateField = async (id, field, token) => {
  const res = await axios.put(`${API}/fields/${id}`, field, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteField = async (id, token) => {
  const res = await axios.delete(`${API}/fields/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
