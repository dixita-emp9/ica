import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchUser, fetchUserPortfolios, updatePortfolio } from './services/apiService';
import './Portfolios.css';

const Newportfolio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);  // Modal state
  const [wishlist, setWishlist] = useState('');  // Wishlist state for new portfolio

  // Fetch user data and portfolios
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

        console.log(`Navigating to Portfolioslist with ID: ${portfolioId}, Wishlist: ${wishlistName}, Items: ${wishlistItems}`);

        navigate(`/portfolioslist/${portfolioId}`, {
          state: { 
            portfolioId: portfolioId,
            wishlistName: wishlistName,
            wishlistItems: wishlistItems
          }
        });
      } else {
        console.error("Portfolio not found with ID:", portfolioId);
      }
    } else {
      console.error("User portfolio is not an array:", userPortfolio);
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
    try {
      const response = await updatePortfolio(wishlist, []);  // Creating a new portfolio with empty items
      console.log('Portfolio updated:', response.data);
      setShowModal(false);

      // Refresh portfolios
      const refreshedResponse = await fetchUserPortfolios();
      setPortfolios(refreshedResponse.data);
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong, please try again.');
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

      {/* Modal for creating a new portfolio */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Portfolio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formCategory">
              <Form.Label>Wishlist Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Wishlist Name"
                value={wishlist}
                onChange={(e) => setWishlist(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-4">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Newportfolio;
