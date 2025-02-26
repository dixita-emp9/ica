import React, { useState, useEffect } from 'react';
import { generatePdf } from './services/apiService';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchUserPortfolios, addItemToPortfolio, fetchPostById, fetchUser, createPortfolio,createPortfolioAndAddItem } from './services/apiService';
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

  const handleCreateNewPortfolio = async () => {
    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getFullYear()).slice(-2)}`;
      
      const todayPortfolios = portfolios.filter(portfolio => portfolio.name.startsWith(dateStr));
      const newCount = todayPortfolios.length + 1;
      const newPortfolioName = `${dateStr}(${newCount})`;
  
      // Create portfolio
      const response = await createPortfolio(newPortfolioName);
      console.log("Portfolio Creation Response:", response); // Debug API response
  
      if (!response?.data || !response.data.id) {
        throw new Error("Portfolio creation failed, no valid ID returned.");
      }
  
      const newPortfolio = response.data;
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio.id);
  
      // Add item to newly created portfolio
      const addItemResponse = await addItemToPortfolio(newPortfolio.id, productId);
      console.log("Add Item Response:", addItemResponse);
  
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to create portfolio and add item.");
    }
  };
  
  const handleCreateNewPortfolioAndAddItem = async () => {
    try {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getFullYear()).slice(-2)}`;

        const todayPortfolios = portfolios.filter(portfolio => portfolio.name.startsWith(dateStr));
        const newCount = todayPortfolios.length + 1;
        const newPortfolioName = `${dateStr}(${newCount})`;

        // Create portfolio & add item
        const response = await createPortfolioAndAddItem(newPortfolioName, productId);

        console.log("Portfolio Created & Item Added:", response);

        if (response?.portfolio) {
            setPortfolios([...portfolios, response.portfolio]); // Update state immediately

            // ✅ Fetch updated portfolios to get the latest items
            const updatedPortfolios = await fetchUserPortfolios();
            console.log("Updated Portfolios:", updatedPortfolios.data);
            setPortfolios(updatedPortfolios.data.wishlists || []);

            navigate(`/portfolioslist/${response.portfolio.id}`, {
                state: {
                    portfolioId: response.portfolio.id,
                    wishlistName: response.portfolio.name,
                    wishlistItems: updatedPortfolios.data.wishlists.find(p => p.id === response.portfolio.id)?.items || [],
                },
            });
        }

        setShowModal(false);
    } catch (error) {
        console.error("Error:", error);
        setError("Failed to create portfolio and add item.");
    }
  };

  const handleBackClick = () => {
    const { portfolioId, wishlistItems, wishlistName } = location.state || {}; // Extract wishlistName too
  
    if (portfolioId && wishlistItems && wishlistName) {
      navigate(`/portfolioslist/${portfolioId}`, { 
        state: { portfolioId, wishlistItems, wishlistName } // Ensure wishlistName is passed
      });
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
        console.log("Selected Portfolio ID:", selectedPortfolio);

        // Check if the item exists in the selected portfolio
        const portfolio = portfolios.find(p => p.id === Number(selectedPortfolio));

        console.log("Found Portfolio:", portfolio);

        if (portfolio) {
            console.log("Portfolio Items:", portfolio.items);
            if (portfolio.items.includes(productId)) {
                setError('Item already exists in the selected portfolio.');
                return;
            }
        }

        const response = await addItemToPortfolio(selectedPortfolio, productId);
        console.log("Add Item Response:", response);

        if (response?.error) {
            throw new Error(response.error);
        }

        // ✅ Manually update the portfolio state after adding the item
        const updatedPortfolios = portfolios.map(p => 
          p.id === Number(selectedPortfolio) ? { ...p, items: [...p.items, Number(productId)] } : p
      );
      
        setPortfolios(updatedPortfolios);

        setShowModal(false);
    } catch (error) {
        console.error("Error saving to portfolio:", error);

        if (error.response?.status === 400) {
            setError("Item already exists in the portfolio.");
        } else if (error.response?.status === 404) {
            setError("Portfolio not found.");
        } else {
            setError("Something went wrong, please try again.");
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
                <Form.Label>Select an existing portfolio</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedPortfolio}
                  onChange={(e) => setSelectedPortfolio(e.target.value)}
                  required
                >
                  <option value="">Select a portfolio</option>
                  {portfolios.length > 0 ? (
                    portfolios.map((portfolio) => (
                      <option key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No portfolios found</option>
                  )}
                </Form.Control>
              </Form.Group>

              <Button variant="danger" type="submit" className="mt-3">
                Save to Portfolio
              </Button>
            </Form>

            <hr />

            <div className="text-center">
              <p>OR</p>
              <Button variant="danger" onClick={handleCreateNewPortfolioAndAddItem}>
                Create New Portfolio
              </Button>
            </div>
          </Modal.Body>
        </Modal>

      </div>
    </div>
  );
};

export default ProductDetail;
