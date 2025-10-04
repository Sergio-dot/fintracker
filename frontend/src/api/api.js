import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
}

export const getIncomes = async (month, user_id) => {
  const params = {};
  if (month !== undefined && month !== null) params.month = month;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;

  const response = await axios.get(`${API_BASE_URL}/incomes/`, { params });
  return response.data;
};

export const getExpenses = async (month, user_id) => {
  const params = {};
  if (month !== undefined && month !== null) params.month = month;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;

  const response = await axios.get(`${API_BASE_URL}/expenses/`, { params });
  return response.data;
};

export const postIncome = async (income) => {
  // income: { amount, owner_id, date }
  const response = await axios.post(`${API_BASE_URL}/incomes/`, income);
  return response.data;
};

export const postExpense = async (expense) => {
  // expense: { amount, category, owner_id, date }
  const response = await axios.post(`${API_BASE_URL}/expenses/`, expense);
  return response.data;
};

export const updateExpense = async (id, expense) => {
  const response = await axios.put(`${API_BASE_URL}/expenses/${id}`, expense);
  return response.data;
};

export const getMonthlySummary = async (month, year) => {
  let m = month;
  if (typeof m === 'string' && m.includes(':')) {
    m = m.split(':')[0];
  }
  m = Number(m);
  const params = { month: m };
  if (year) params.year = year;
  const response = await axios.get(`${API_BASE_URL}/expenses/summary`, { params });
  return response.data;
};