import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchUser, fetchUserPortfolios, createPortfolio } from './services/apiService';
import './Portfolios.css';

const Newportfolio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);  // Modal state
  const [wishlist, setWishlist] = useState('');  // Wishlist state for new portfolio
  const [portfolioName, setPortfolioName] = useState('');


  // Fetch user data and portfolios
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUser();
        setUser(response.data);
        
        const portfoliosResponse = await fetchUserPortfolios();
        console.log("Fetched Portfolios:", portfoliosResponse.data);
  
        if (portfoliosResponse.data && portfoliosResponse.data.wishlists) {
          setPortfolios(portfoliosResponse.data.wishlists);  // ✅ Ensure wishlists are stored
        }
      } catch (err) {
        console.log("Error fetching user:", err);
        setError("Failed to load user data.");
      }
    };
  
    fetchUserData();
  }, []);  

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

  const handleBackClick = () => {
    // Navigate to the Portfolioslist with the wishlistId
      navigate('/portfolios');
  };

  // Modal control functions
  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  // Handle form submission for creating new portfolio
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
  
    try {
      const response = await createPortfolio(portfolioName);
      console.log("Portfolio created:", response.data);
  
      setShowModal(false);
      setWishlist("");
  
      // Refresh portfolios
      const refreshedResponse = await fetchUserPortfolios();
      if (refreshedResponse.data && refreshedResponse.data.wishlists) {
        setPortfolios(refreshedResponse.data.wishlists);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message); // Set the exact error message from API
      } else {
        setError("Something went wrong, please try again."); // Fallback error message
      }
    }
  };   

  return (
    <div className="main_menu_wrapper container">
      <div className='d-flex justify-content-between'>
        <div className='backbtn'>
          <button onClick={handleBackClick}>
          <i className="fa fa-arrow-left"></i>
          </button>
        </div>
        <div>
          <h5 className="black-text">SELECT PORTFOLIO TO ADD TO</h5>
        </div>
      </div>

      <div className="portfolios mt-4 pt-5">
                {/* Create New Portfolio Button */}
                <div>
          <button className="create_btn" onClick={handleModalOpen}>
            <svg fill="#6c757d" viewBox="0 0 302.816 302.816">
              <path d="M298.423,152.996c-5.857-5.858-15.354-5.858-21.213,0l-35.137,35.136
                c-5.871-59.78-50.15-111.403-112.001-123.706c-45.526-9.055-92.479,5.005-125.596,37.612c-5.903,5.813-5.977,15.31-0.165,21.213
                c5.813,5.903,15.31,5.977,21.212,0.164c26.029-25.628,62.923-36.679,98.695-29.565c48.865,9.72,83.772,50.677,88.07,97.978
                l-38.835-38.835c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l62.485,62.485
                c2.929,2.929,6.768,4.393,10.606,4.393s7.678-1.464,10.607-4.393l62.483-62.482C304.281,168.352,304.281,158.854,298.423,152.996z"
              />
            </svg>
            <span>Create new</span>
          </button>
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

      {/* Modal for creating a new portfolio */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Portfolio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formCategory">
              <Form.Label>Portfolio Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Portfolio Name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="mt-4">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Newportfolio;
