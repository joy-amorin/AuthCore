import client from '../api/client';

export const login = async (username: string, password: string) => {
  const response = await client.post('/auth/login/', { username, password });
  const token = response.data.token;
  localStorage.setItem('token', token);
  return token;
};

export const logout = () => {
  localStorage.removeItem('token');
};
