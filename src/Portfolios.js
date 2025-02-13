import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, fetchUserPortfolios } from './services/apiService';
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
        {user ? <h5 className="black-text">{user.name}</h5> : <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}
      </div>

      <div className="portfolios">
        <div className="text-center mt-4">
          <div className="qr-code-box p-3 mb-4">
            <button onClick={handleScanClick} className="btn mb-3">
              <img src="/scanner.png" alt="Scan QR Code" className="img-fluid" />
            </button>
            <h3>
              Scan QR Code <br /> View In AR
            </h3>
            <div id="qr-code-scanner" style={{ width: '100%' }}></div>
            {scanResult && <div><p>Scanned Result: {scanResult}</p></div>}
          </div>
        </div>

        <div className="row">
          {portfolios && portfolios.length > 0 ? ( // ✅ Ensure portfolios is checked properly
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
                </div>
              </div>
            ))
          ) : (
            <p>No wishlists found.</p> // ✅ Will only show if portfolios is empty
          )}
        </div>

      </div>
    </div>
  );
};

export default Portfolios;
