import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, fetchUserPortfolios } from './services/apiService';
import { Html5Qrcode } from 'html5-qrcode'; // Import the library
import './Portfolios.css';

const Portfolios = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState('');
  const qrCodeRef = useRef(null); // Ref for QR code scanner

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
    const html5QrCode = new Html5Qrcode("qr-code-scanner");

    const startScanner = () => {
      const config = { fps: 10, qrbox: 250, facingMode: { exact: "environment" } }; // Back camera
      html5QrCode.start({ facingMode: { exact: "environment" } }, config, (decodedText) => {
        console.log('Scanned QR Code:', decodedText);
        setScanResult(decodedText);
        window.location.href = decodedText; // Navigate to the scanned URL
      })
      .catch(err => {
        console.error("Error starting QR code scanner:", err);
      });
    };

    startScanner();

    // Cleanup function to stop the scanner
    return () => {
      html5QrCode.stop().catch(err => {
        console.error("Error stopping QR code scanner:", err);
      });
    };
  }, []);

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
            <h3>Scan QR Code</h3>
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
