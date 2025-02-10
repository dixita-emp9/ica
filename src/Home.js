import React from 'react';
import './Auth.css';

const Register = () => {
  return (
    <div className="form-container">
        <div className="logo-box mb-4">
          <img src="/ICA_new_logo_White.png" alt="ICA Logo" className="logo" />
        </div>
        <div>
          <a href="/register" className="btn home_register border-danger" role="button">Register</a>
          <a href="/login" className="btn bg_danger  w-100 p-3 mt-3" role="button">Log In</a>
        </div>
    </div>
  );
};

export default Register;
