import React from 'react';
import { Navigate } from 'react-router-dom';
import { fetchUser } from '../services/apiService';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(null);

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                await fetchUser();
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Optionally, show a loading indicator
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;