import React, { useEffect, useState, useRef } from 'react';
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
  const [scannerActive, setScannerActive] = useState(false); // State to control scanner

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
  }, []);

  useEffect(() => {
    let stopScanner;

    if (scannerActive) {
      stopScanner = startQrScanner(setScanResult, setScannerActive);
    }

    return () => {
      if (stopScanner) stopScanner();
    };
  }, [scannerActive]);

  const handleScanClick = () => {
    setScannerActive(true);
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
      const selectedPortfolio = userPortfolio.find(portfolio => portfolio.id === portfolioId);

      if (selectedPortfolio) {
        const wishlistName = selectedPortfolio.wishlist;
        const wishlistItems = selectedPortfolio.items || [];

        navigate(`/portfolioslist/${portfolioId}`, {
          state: { 
            portfolioId,
            wishlistName,
            wishlistItems
          }
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
            <img src="/scanner.png" alt="Scan QR Code" className="img-fluid" />
            </button>
            <h3>Scan QR Code <br/> View In AR</h3>
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
                    <img src="/home.svg" alt={`Portfolio ${portfolio.id}`} className="img-fluid mb-2" />
                  </div>
                  <div className="mt-2">
                    <h4>{portfolio.wishlist}</h4>
                  </div>
                  <div className="mt-2">
                    <small>{portfolio.items && portfolio.items.length > 0 ? `${portfolio.items.length} items` : 'Empty'}</small>
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
