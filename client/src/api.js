import axios from "axios";

const API_URL = "http://localhost:5050";

export const getItems = async () => {
  const response = await axios.get(`${API_URL}/items`);
  return response.data;
};

export const saveInvoice = async (invoice) => {
  const response = await axios.post(`${API_URL}/save-invoice`, invoice);
  return response.data;
};

export const updateInvoice = async (invoiceNo, updatedData) => {
  const response = await axios.put(
    `http://localhost:5050/update-invoice/${invoiceNo}`,
    updatedData
  );
  return response.data;
};

export const deleteInvoice = async (invoiceNo) => {
  const response = await axios.delete(
    `http://localhost:5050/delete-invoice/${invoiceNo}`
  );
  return response.data;
};
