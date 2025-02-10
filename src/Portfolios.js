import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, fetchUserPortfolios } from './services/apiService';
import { startQrScanner } from './services/qrScanner';
import './Portfolios.css';

const Portfolios = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUser();
        setUser(response.data);
        const portfoliosResponse = await fetchUserPortfolios();
        setPortfolios(portfoliosResponse.data);
      } catch (err) {
        console.log("Error fetching user:", err);
        setError('Failed to load user data.');
      }
    };

    fetchUserData();

    // Check for the welcome popup flag in localStorage
    if (localStorage.getItem('showWelcomePopup') === 'true') {
      setShowPopup(true);
      localStorage.removeItem('showWelcomePopup'); // Remove the flag after showing the popup
    }
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

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const handlePortfolioClick = (portfolioId) => {
    let userPortfolio = user.portfolio;
  
    if (typeof userPortfolio === 'string') {
      try {
        userPortfolio = JSON.parse(userPortfolio);
      } catch (error) {
        console.error("Error parsing user portfolio:", error);
        return;
      }
    }
  
    if (Array.isArray(userPortfolio)) {
      const selectedPortfolio = userPortfolio.find(
        (portfolio) => portfolio.id === portfolioId
      );
  
      if (selectedPortfolio) {
        const wishlistName = selectedPortfolio.wishlist; // Extract wishlist name
        const wishlistItems = selectedPortfolio.items || [];
  
        navigate(`/portfolioslist/${portfolioId}`, {
          state: {
            portfolioId,
            wishlistName, // Pass wishlist name
            wishlistItems,
          },
        });
      } else {
        console.error("Portfolio not found with ID:", portfolioId);
      }
    } else {
      console.error("User portfolio is not an array:", userPortfolio);
    }
  };  

  return (
    <div className="main_menu_wrapper container">
      {showPopup && (
        <div className="full-screen-popup">
          <div className="popup-content">
            {/* Close Button with Icon */}
            <button className="close-button" onClick={handleClosePopup}>
              <i className="fa fa-times"></i>
            </button>

            {/* Title and Description */}
            <h4>Welcome to ICA La Galleria</h4>
            <p>
              Explore the world of Italian Wood Finishes. Take a walkthrough of the ICA
              La Galleria and scan the QR Code to add the finishes you like to your
              portfolio or view in AR.
            </p>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        {user ? (
          <h5 className="black-text">{user.name}</h5>
        ) : (
          <p>Loading...</p>
        )}
        {error && <p className="text-danger">{error}</p>}
      </div>

      <div className="portfolios">
        <div className="text-center mt-4">
          <div className="qr-code-box p-3 mb-4">
            <button onClick={handleScanClick} className="btn mb-3">
              <img
                src="/scanner.png"
                alt="Scan QR Code"
                className="img-fluid"
              />
            </button>
            <h3>
              Scan QR Code <br /> View In AR
            </h3>
            <div id="qr-code-scanner" style={{ width: '100%' }}></div>
            {scanResult && (
              <div>
                <p>Scanned Result: {scanResult}</p>
              </div>
            )}
          </div>
        </div>
        <div className="row">
          {portfolios.length > 0 ? (
            portfolios.map((portfolio) => (
              <div key={portfolio.id} className="col-6 col-md-3 mb-4">
                <div
                  className="shadow portfolio-box p-3"
                  onClick={() => handlePortfolioClick(portfolio.id)}
                >
                  <div>
                    <img
                      src="/home.svg"
                      alt={`Portfolio ${portfolio.id}`}
                      className="img-fluid mb-2"
                    />
                  </div>
                  <div className="mt-2">
                    <h4>{portfolio.wishlist}</h4>
                  </div>
                  <div className="mt-2">
                    <small>
                      {portfolio.items && portfolio.items.length > 0
                        ? `${portfolio.items.length} items`
                        : 'Empty'}
                    </small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No portfolios found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolios;
