import React, { useState, useEffect } from 'react';
import { generatePdf } from './services/apiService';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchUserPortfolios, addItemToPortfolio, fetchPostById, fetchUser } from './services/apiService';
import './ProductDetail.css';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const location = useLocation();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUser();
        setUser(response.data);
  
        const portfolioResponse = await fetchUserPortfolios();
        console.log("Fetched Portfolio Response:", portfolioResponse.data);
  
        if (portfolioResponse.data && portfolioResponse.data.wishlists) {
          setPortfolios(portfolioResponse.data.wishlists); // ✅ Store only user's wishlists
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError('Failed to load user data.');
      }
    };
  
    fetchUserData();
  }, []);

  
  useEffect(() => {
    const getPortfolios = async () => {
      try {
        const response = await fetchUserPortfolios();
        const data = response.data;
  
        if (Array.isArray(data)) {
          setPortfolios(data);
        } else {
          setPortfolios([data]); // ✅ Wrap single object in an array
        }
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

  const handleDownloadPDF = async () => {
    try {
      const response = await generatePdf([productId]); // Pass productId in an array
  
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `Product_${productId}_${Date.now()}.pdf`; // Unique filename
  
        a.href = url;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        throw new Error('PDF generation failed. No data returned.');
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError('Failed to download PDF.');
    }
  };

  const handleCreateNewPortfolio = () => {
    // Redirect to create portfolio page
    window.location.href = "/createportfolio";
  
    // OR open a modal for portfolio creation
    // setShowCreatePortfolioModal(true);
  };
  
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
    setError(null); // Reset error before proceeding

    if (!selectedPortfolio) {
        setError('Please select a portfolio.');
        return;
    }

    if (!productId) {
        setError('Invalid item selected.');
        return;
    }

    try {
        // Check if the item is already in the selected portfolio
        const portfolio = portfolios.find(p => p.id === selectedPortfolio);
        if (portfolio && portfolio.items.includes(productId)) {
            setError('Item already exists in the selected portfolio.');
            return;
        }

        const response = await addItemToPortfolio(selectedPortfolio, productId);

        if (response?.error) {
            throw new Error(response.error);
        }

        setShowModal(false);
    } catch (error) {
        console.error('Error saving to portfolio:', error);

        if (error.response?.status === 400) {
            setError('Item already exists in the portfolio.');
        } else if (error.response?.status === 404) {
            setError('Portfolio not found.');
        } else {
            setError('Something went wrong, please try again.');
        }
    }
};

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className='main_menu_wrapper'>
      <div className='container'>

        <div className='d-flex align-items-center justify-content-between' >
          {/* Back Button */}
          <div className='backbtn'>
        <button onClick={handleBackClick}>
          <i className="fa fa-arrow-left"></i>
        </button>
      </div>

          {/* Download PDF Button */}
          <div>
            <button className="pdf_btn" onClick={handleDownloadPDF}>
              <i className="fa fa-download"></i> Save PDF
            </button>
          </div>
        </div>

        <div className='product-container mt-4'>
          <div className='image-container'>
            <span className="black-text product_code">Product Name : </span><span>{product.title}</span>
            <br />
            <span className="black-text product_code">Product Code: </span><span>{product.product_code}</span>
            <div className='col-12 mt-3'>
              <img src={`https://api.ica.amigosserver.com/storage/${product.image}`} alt={product.title} className="img-fluid product_img" />
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
          
          <div className="row justify-content-center mt-4">
            <div className="col-10 col-md-6">
              <div dangerouslySetInnerHTML={{ __html: product.body }} />
            
            <div className="mt-3 mb-2">
              <div><strong>Follow us on Social Media:</strong></div>
              <div className="footer-social">
                <a href="https://www.linkedin.com/in/ica-pidilite-private-limited" target="_blank">
                  <img src="/linkedin.png" alt="LinkedIn" />
                </a>
                <a href="https://www.instagram.com/icapidilite" target="_blank">
                  <img src="/instagram.png" alt="Instagram" />
                </a>
                <a href="https://www.facebook.com/ICAPidiliteIndia" target="_blank">
                  <img src="/facebook.png" alt="Facebook" />
                </a>
              </div>
              </div>
            </div>
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
                  onChange={(e) => {
                    if (e.target.value === "create_new") {
                      handleCreateNewPortfolio(); // Open create portfolio modal
                    } else {
                      setSelectedPortfolio(e.target.value);
                    }
                  }}
                  required
                >
                  <option value="">Select a portfolio</option>
                  {portfolios.length > 0 ? (
                    portfolios.map((wishlist) => (
                      <option key={wishlist.id} value={wishlist.id}>
                        {wishlist.name}  {/* ✅ Use `wishlist.name` instead of `wishlist.wishlist` */}
                      </option>
                    ))
                  ) : (
                    <option disabled>No wishlists found</option>
                  )}
                  <option value="create_new">Create New Portfolio</option>
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
