import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchUserPortfolios, addItemToPortfolio, fetchPostById } from './services/apiService';
import './ProductDetail.css';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
    const getPortfolios = async () => {
      try {
        const response = await fetchUserPortfolios();
        setPortfolios(response.data);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };

    getPortfolios();
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetchPostById(productId);
        setProduct(response.data);
        if (response.data.wishlistId) {
          setSelectedPortfolio(response.data.wishlistId);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    getProduct();
  }, [productId]);

  const handleBackClick = () => {
    const { portfolioId, wishlistItems } = location.state || {};
  
    if (portfolioId && wishlistItems) {
      navigate(`/portfolioslist/${portfolioId}`, { state: { portfolioId, wishlistItems } });
    } else {
      navigate('/portfolios'); // Fallback if no state is available
    }
  };
  
  const handleViewInARClick = () => {
    navigate('/viewinar', { state: { productId, arUrl: product.ar_url } });
  };  
  
  const handleSaveToPortfolioClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPortfolio) {
        setError('Please select a portfolio.');
        return;
    }

    try {
        // Check if the item is already in the selected portfolio
        const portfolio = portfolios.find(p => p.id === selectedPortfolio);
        if (portfolio && portfolio.items.includes(productId)) {
            setError('Item already exists in the selected portfolio.');
            return;
        }

        await addItemToPortfolio(selectedPortfolio, productId);
        setShowModal(false);
    } catch (error) {
        console.error('Error saving to portfolio:', error);
        setError('Something went wrong, please try again.');
    }
  };

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className='main_menu_wrapper'>
      <div className='container'>
        <div className='d-flex justify-content-between'>
          <div className='backbtn'>
            <button onClick={handleBackClick}>
            <i className="fa fa-arrow-left"></i>
            </button>
          </div>
          <h5 className="black-text">{product.title}</h5>
        </div>

        <div className='product-container mt-4'>
          <div className='image-container'>
            <h5 className="black-text">{product.title}</h5>
            <div className='col-12'>
              <img src={`https://api.ica.amigosserver.com/storage/${product.image}`} alt={product.title} className="img-fluid product_img" />
              <p className="product_code">Product Code: <b>{product.product_code}</b></p>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-10 col-md-6">
              <div dangerouslySetInnerHTML={{ __html: product.body }} />
            </div>
          </div>

          <div className='button-container'>
            <button className="portfolio_btn" onClick={handleSaveToPortfolioClick}>
              <i className="fa fa-folder-open" style={{ marginRight: '10px' }}></i>Save to Portfolio
            </button>
            <button className="portfolio_btn" onClick={handleViewInARClick}>
              <i className="bi bi-phone" style={{ marginRight: '10px' }}></i>View in AR
            </button>
          </div>
        </div>

        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Select Portfolio</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <p className="text-danger">{error}</p>}
            <Form onSubmit={handleFormSubmit}>
              <Form.Group controlId="formPortfolio">
                <Form.Label>Select Wishlist (Portfolio)</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedPortfolio}
                  onChange={(e) => setSelectedPortfolio(e.target.value)}
                  required
                >
                  <option value="">Select a portfolio</option>
                  {portfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.wishlist}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-4">
                Save to Portfolio
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default ProductDetail;
