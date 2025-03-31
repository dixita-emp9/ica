import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, fetchUserPortfolios, deletePortfolio  } from './services/apiService';
import { startQrScanner } from './services/qrScanner';
import './Portfolios.css';

const Portfolios = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUser();
        setUser(response.data);
  
        const portfolioResponse = await fetchUserPortfolios();
        console.log("Fetched Portfolio Response:", portfolioResponse.data);
  
        if (portfolioResponse.data && Array.isArray(portfolioResponse.data.wishlists)) {
          setPortfolios(portfolioResponse.data.wishlists); // ✅ Correctly set portfolios
        } else {
          setPortfolios([]); // ✅ Ensure it's always an array
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError('Failed to load user data.');
      }
    };
  
    fetchUserData();
    
    // ✅ Show popup only on first login
    const showPopupFlag = localStorage.getItem('showWelcomePopup');
    if (showPopupFlag === 'true') {
      setShowPopup(true);
      localStorage.removeItem('showWelcomePopup'); // Remove so it doesn't show again
    }
  }, []); 
  
  const handleScanClick = async () => {
    console.log('Scan QR Code clicked!');
    try {
      await startQrScanner((decodedText) => {
        console.log('Scanned QR Code:', decodedText);
        window.location.href = decodedText;
      }, () => {});
    } catch (error) {
      console.error('Error starting QR scanner:', error);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    try {
      await deletePortfolio(portfolioId);
      setPortfolios((prevPortfolios) => prevPortfolios.filter(p => p.id !== portfolioId));
      console.log("Portfolio deleted:", portfolioId);
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handlePortfolioClick = (wishlistId) => {
    if (!portfolios || portfolios.length === 0) {
      console.error("No wishlists found.");
      return;
    }
  
    const selectedWishlist = portfolios.find((wishlist) => wishlist.id === wishlistId);
  
    if (selectedWishlist) {
      console.log("Navigating with:", selectedWishlist);
      navigate(`/portfolioslist/${wishlistId}`, {
        state: {
          portfolioId: wishlistId, 
          wishlistName: selectedWishlist.name, 
          wishlistItems: selectedWishlist.items || [],  // ✅ Sending full post details
        },
      });
    } else {
      console.error("Wishlist not found with ID:", wishlistId);
    }
  };
   

  return (
    <div className="main_menu_wrapper container">
      {showPopup && (
        <div className="full-screen-popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleClosePopup}>
              <i className="fa fa-times"></i>
            </button>
            <h5>Welcome to ICA La Galleria – Experience Center. <br/><br/> Explore the world of Luxury Italian Wood Finishes</h5>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        {user ? <h5 className="text-light">{user.name}</h5> : <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}
      </div>

      <div className="portfolios">
        <div className="text-center mt-4">
          <div className="qr-code-box p-3 mb-4">
            <h5 style={{ fontSize: '1rem' }}>
            Scan the QR Code on the finished panel to know more about the finishes
            </h5>
            <button onClick={handleScanClick} className="btn mb-3">
              <img src="/scan.png" alt="Scan QR Code" style={{ width: '50%'}} />
            </button>
            <h5 style={{ fontSize: '1rem' }}>Click Here to Scan</h5>
            <div id="qr-code-scanner" style={{ width: '100%' }}></div>
            {scanResult && <div><p>Scanned Result: {scanResult}</p></div>}
          </div>
        </div>

        <div className="row">
          {portfolios && portfolios.length > 0 ? (
            portfolios.map((wishlist) => (
              <div key={wishlist.id} className="col-6 col-md-3 mb-4">
                <div className="shadow portfolio-box p-3" onClick={() => handlePortfolioClick(wishlist.id)}>
                  <div>
                    <img src="/home.svg" alt={`Wishlist ${wishlist.id}`} className="img-fluid mb-2" />
                  </div>
                  <div className="mt-2">
                    <h4>{wishlist.name}</h4>
                  </div>
                  <div className="mt-2">
                    <small>
                      {wishlist.items && wishlist.items.length > 0
                        ? `${wishlist.items.length} items`
                        : 'Empty'}
                    </small>
                  </div>
                  <button
                    className="btn position-absolute top-0 end-0 m-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from triggering navigation
                      handleDeletePortfolio(wishlist.id);
                    }}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No wishlists found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolios;
