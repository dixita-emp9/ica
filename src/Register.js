import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './services/apiService';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();

        registerUser(name, email, password, passwordConfirmation)
            .then(response => {
                // alert('Registration successful');
                navigate('/');
            })
            .catch(error => {
                if (error.response && error.response.data.errors) {
                    setErrors(error.response.data.errors); // Set validation errors
                } else {
                    console.error('Registration error:', error);
                }
            });
    };

    return (
        <div className="form-container">
            <div className="logo-box mb-4">
                <img src="/ICA_logo_Red.png" alt="ICA Logo" className="logo" />
            </div>
            <form className="form-content" onSubmit={handleRegister}>
                <div className="form-group mt-4">
                    <input
                        type="text"
                        className="form-control p-3"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <div className="text-danger">{errors.name[0]}</div>}
                </div>
                <div className="form-group mt-4">
                    <input
                        type="email"
                        className="form-control p-3"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <div className="text-danger">{errors.email[0]}</div>}
                </div>
                <div className="form-group mt-4">
                    <input
                        type="password"
                        className="form-control p-3"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <div className="text-danger">{errors.password[0]}</div>}
                </div>
                <div className="form-group mt-4">
                    <input
                        type="password"
                        className="form-control p-3"
                        placeholder="Confirm Password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                    {errors.password_confirmation && <div className="text-danger">{errors.password_confirmation[0]}</div>}
                </div>
                <button type="submit" className="submit_btn btn bg_danger p-3 mt-4">
                    Register
                </button>
                <div className="login-link mt-4">
                    <p>Already have an account? <a href="/login">Log In</a></p>
                </div>
            </form>
        </div>
    );
};

export default Register;
