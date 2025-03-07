import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './services/apiService';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
      e.preventDefault();

      try {
          const response = await loginUser(email, password);
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('showWelcomePopup', 'true'); // Set a flag for the popup
          navigate('/portfolios'); // Redirect to portfolios page
      } catch (err) {
          setError('Login failed. Please check your credentials.');
      }
  };

  return (
    <div className="form-container">
      <div className="logo-box mb-4">
        <img src="/2-ICA-GOOD-TASTE-SHOWS-Red.png" alt="ICA Logo" className="logo" />
      </div>
      
      <form className="form-content" onSubmit={handleLogin}>
        <div className="form-group mt-4">
          
          <input
                    type="email"
                    className="form-control p-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
        </div>
        <div className="form-group mt-4">
          
          <input
                    type="password"
                    className="form-control p-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
        </div>
        <button type="submit" className="submit_btn btn bg_danger p-3 mt-4">
          Log In
        </button>
        <div className="login-link mt-4">
          <p>Forgot Password? <a href="/register">Go Back</a></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
