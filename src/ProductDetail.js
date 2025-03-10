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

  const handleWhatsAppClick = (event) => {
    event.preventDefault(); // Prevent default link behavior
  
    const currentUrl = encodeURIComponent(window.location.href); // Encode URL
    const message = `Check out this link: ${currentUrl}`; // WhatsApp auto-links URLs
  
    // Open WhatsApp with the message
    window.open(`https://wa.me/?text=${message}`, "_blank");
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
        const day = String(today.getDate()).padStart(2, '0');
        const month = today.toLocaleString('en-US', { month: 'short' });
        const year = String(today.getFullYear()).slice(-2);
        
        const dateStr = `${day}${month}${year}`; // Format: 02Feb25

        const todayPortfolios = portfolios
            .map(portfolio => portfolio.name)
            .filter(name => name.startsWith(dateStr))
            .map(name => {
                const match = name.match(/\((\d+)\)$/);
                return match ? parseInt(match[1], 10) : 0;
            });

        const newCount = todayPortfolios.length ? Math.max(...todayPortfolios) + 1 : 1;
        const newPortfolioName = `${dateStr}(${newCount})`;

        console.log("New Portfolio Name:", newPortfolioName);

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
          <div clasName='detail-about'>
            <h5 className="black-text">About ICA</h5>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p> 
          </div>
          
          <div className='image-container'>
            <h5 className="black-text">Your Selection</h5>
            <div className='col-12 mt-3'>
              <img src={`https://api.ica.amigosserver.com/storage/${product.image}`} alt={product.title} className="img-fluid product_img" />
            </div>
          </div>

          <div className='prod-cat'>
            {product.parent_category_name && (
              <h6 className="black-text">{product.parent_category_name}</h6>
            )}
            {product.category_name && (
              <h6 className="black-text pl-10">- {product.category_name}</h6>
            )}
          </div> 
              
          <div className='prod-title'>
            <h5 className="black-text product_code">Product Name : </h5>     
            <span>{product.title}</span>
          </div>

          <div>
            <h5 className="black-text product_code">Product Code: </h5>
            <span>{product.product_code}</span>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-md-6">
              <div dangerouslySetInnerHTML={{ __html: product.body }} />
              </div>
            
              <div className='button-container pt-3 pb-3'>
                <strong>Like the Finish? Add it your collection </strong>
                <button className="portfolio_btn" onClick={handleSaveToPortfolioClick}>
                  <i className="fa fa-folder-open" style={{ marginRight: '10px' }}></i>Save to Portfolio
                </button>
                
              </div>

              <div className='button-container pb-3'>
              <strong>Visualise the Finish on a furniture piece </strong>
                <button className="portfolio_btn" onClick={handleViewInARClick}>
                  <i className="bi bi-phone" style={{ marginRight: '10px' }}></i>View in AR
                </button>
              </div>

              <div className="whatsapp">
                <a href="#" onClick={handleWhatsAppClick}>
                  <h5>Share via WhatsApp  </h5>
                  <img src="/whatsapp.png" alt="whatsapp" />
                </a>
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
