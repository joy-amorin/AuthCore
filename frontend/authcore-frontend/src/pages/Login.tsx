import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const { access, refresh } = await login(email, password);

    // save tokens in localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    console.log("Access token:", access);
    console.log("Refresh token:", refresh);

    navigate('/home');
  } catch (err) {
    alert("Error de login");
    console.error(err);
  }
};


  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
