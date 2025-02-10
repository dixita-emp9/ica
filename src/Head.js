import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchUser, logoutUser } from './services/apiService';
import { startQrScanner } from './services/qrScanner';
import './Head.css';

const Head = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState(''); // State for user's avatar
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchUser()
            .then((response) => {
                setUserName(response.data.name);
                // Set the avatar URL dynamically
                setUserAvatar(`https://api.ica.amigosserver.com/storage/${response.data.avatar || 'default-avatar.png'}`); 
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const handleScanClick = async () => {
        console.log('Scan QR Code clicked!');
        try {
            await startQrScanner((decodedText) => {
                console.log('Scanned QR Code:', decodedText);
                window.location.href = decodedText; // Redirect to scanned URL
            }, () => {}); // You can pass a no-op for setScannerActive
        } catch (error) {
            console.error('Error starting QR scanner:', error);
        }
    };

    const handleMenuItemClick = (path) => {
        setIsMenuOpen(false); // Close the menu
        if (path === '/scan-qr') {
            navigate('/portfolios', { replace: true }); // Navigate first
            setTimeout(handleScanClick, 500); // Call handleScanClick after a slight delay
        } else {
            navigate(path); // Navigate to other paths
        }
    };    

    const handleLogoClick = () => {
        if (location.pathname === '/portfolios') {
            // Refresh the page
            window.location.reload();
        } else {
            navigate('/portfolios');
        }
    };

    const handleLogout = () => {
        logoutUser()
            .then(() => {
                localStorage.removeItem('authToken');
                navigate('/login');
            })
            .catch(error => {
                console.error('Logout error:', error);
            });
    };

    return (
        <header>
            <nav className="curve">
                <i 
                    className="bi bi-list" 
                    style={{ fontSize: "2rem", cursor: "pointer" }} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                ></i>
                <img 
                    src="/ICA_new_logo_Black.png" 
                    alt="ICA Logo" 
                    className="img-fluid mainlogo" 
                    onClick={handleLogoClick} 
                />
                <img 
                    src={userAvatar} // Use dynamic avatar here
                    alt="Profile Logo" 
                    className="img-fluid profilelogo" 
                    onClick={() => navigate('/profile')}
                />
            </nav>
            
            {isMenuOpen && (
                <div className="side-menu">
                    <div className="side-menu-content">
                        <i 
                            className="bi bi-x" 
                            style={{ fontSize: "2rem", cursor: "pointer" }} 
                            onClick={() => setIsMenuOpen(false)}
                        ></i>
                        <div className="menu-header">
                            <img 
                                src={userAvatar} // Use dynamic avatar here
                                alt="Profile" 
                                className="profile-picture"
                            />
                            <h4>{userName ? userName : 'Loading...'}</h4>
                        </div>
                        <ul className="menu-items">
                            <li className='btn' onClick={() => handleMenuItemClick('/profile')}><i className="fa fa-user"></i> Profile</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/portfolios')}><i className="fa fa-home"></i> Home</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/scan-qr')}><i className="fa fa-camera"></i> Scan QR Code</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/createportfolio')}><i className="fa fa-briefcase"></i> Create New Portfolio</li>
                            <li className='btn' onClick={handleLogout}><i className="fa fa-sign-out"></i> Sign Out</li>
                        </ul>
                        <div className="menu-footer">
                            <img 
                                src="/ICA_new_logo_Black.png" 
                                alt="ICA Logo" 
                                className="img-fluid"
                            />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Head;
