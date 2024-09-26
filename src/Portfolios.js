import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, fetchUserPortfolios } from './services/apiService';
import Webcam from 'react-webcam';  // Import react-webcam
import './Portfolios.css';

const Portfolios = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);  // Manage camera visibility
  const webcamRef = useRef(null);  // Reference to the webcam
  
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

            console.log(`Navigating to Portfolioslist with ID: ${portfolioId}, Wishlist: ${wishlistName}, Products: ${wishlistItems}`);

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

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log("Captured image:", imageSrc);
    // Optionally: Handle the captured image, e.g., upload or process
  };

  const handleCameraClick = () => {
    setShowCamera(true);  // Show the camera when the user clicks the button
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
            <div>
              {/* Button to trigger the camera */}
              <button onClick={handleCameraClick}>
                <img src="/camera.png" alt="Open Camera" className="img-fluid" />
              </button>
            </div>
            <div className="text-center">
              <h3>Open Camera</h3>
            </div>
          </div>

          {/* Camera will appear here */}
          {showCamera && (
            <div className="camera-wrapper">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%' }}
              />
              <button onClick={handleCapture}>Capture Photo</button>
            </div>
          )}
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
