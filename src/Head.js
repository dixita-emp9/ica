import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, logoutUser } from './services/apiService'; // Import fetchUser
import QrScanner from './QrScanner';
import './Head.css';

const Head = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userName, setUserName] = useState(''); // State for storing user name
    const [isQrScannerVisible, setIsQrScannerVisible] = useState(false); // State for QR scanner visibility
    const navigate = useNavigate();

    // Fetch current user data when the component mounts
    useEffect(() => {
        fetchUser()
            .then((response) => {
                setUserName(response.data.name); // Update userName with the fetched name
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const handllogoClick = () => {
        console.log("Logo clicked");
        navigate('/portfolios');
    };

    const handlprofileClick = () => {
        console.log("Profile clicked");
        navigate('/profile');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuItemClick = (path) => {
        if (path === '/logout') {
            handleLogout();
        } else if (path === '/scan-qr') {
            setIsQrScannerVisible(true); // Activate the QR scanner
            setIsMenuOpen(false); // Close the menu after activation
        } else {
            navigate(path);
            setIsMenuOpen(false); // Close the menu after navigation
        }
    };

    const handleLogout = () => {
        logoutUser()
            .then(() => {
                // Clear local storage or any other cleanup
                localStorage.removeItem('authToken');
                // Redirect to login or home page after logout
                navigate('/login'); // Adjust the path as necessary
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
                    onClick={toggleMenu}
                ></i>
                <img 
                    src="/logo.png" 
                    alt="ICA Logo" 
                    className="img-fluid mainlogo" 
                    onClick={handllogoClick}
                />
                <img 
                    src="/profile.png" 
                    alt="Profile Logo" 
                    className="img-fluid profilelogo" 
                    onClick={handlprofileClick}
                />
            </nav>
            
            {/* Side Menu */}
            {isMenuOpen && (
                <div className="side-menu">
                    <div className="side-menu-content">
                        <i 
                            className="bi bi-x" 
                            style={{ fontSize: "2rem", cursor: "pointer" }} 
                            onClick={toggleMenu}
                        ></i>
                        <div className="menu-header">
                            <img 
                                src="/profile.png" 
                                alt="Profile" 
                                className="profile-picture"
                            />
                            <h4>{userName ? userName : 'Loading...'}</h4>
                        </div>
                        <ul className="menu-items">
                            <li className='btn' onClick={() => handleMenuItemClick('/profile')}><i className="fa fa-user"></i> Profile</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/portfolios')}><i className="fa fa-home"></i>Home</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/scan-qr')}><i className="fa fa-camera"></i> Scan QR Code</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/createportfolio')}><i className="fa fa-briefcase"></i> Create New Portfolio</li>
                            <li className='btn' onClick={() => handleMenuItemClick('/logout')}><i className="fa fa-sign-out"></i> Sign Out</li>
                        </ul>
                        <div className="menu-footer">
                            <img 
                                src="/logo.png" 
                                alt="ICA Logo" 
                                className="img-fluid"
                            />
                            <p>ITALIAN WOOD FINISHES</p>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Scanner Modal */}
            {isQrScannerVisible && (
                <div className="qr-scanner-modal">
                    <QrScanner onScan={(decodedText) => {
                        setIsQrScannerVisible(false); // Hide scanner after scanning
                        window.location.href = decodedText; // Navigate to the scanned URL
                    }} />
                    <button onClick={() => setIsQrScannerVisible(false)} className="btn btn-secondary">
                        Close Scanner
                    </button>
                </div>
            )}
        </header>
    );
};

export default Head;
