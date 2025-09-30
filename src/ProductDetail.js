import React, { useState, useEffect } from 'react';
import { generatePdf } from './services/apiService';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchUserPortfolios, addItemToPortfolio, fetchPostById, fetchPostBySlug, fetchUser, createPortfolioAndAddItem } from './services/apiService';
import './ProductDetail.css';

const ProductDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.state?.productId;
  const { slug } = useParams();
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);
  const [isProductInPortfolio, setIsProductInPortfolio] = useState(false); // Track if product exists in any portfolio

  useEffect(() => {
    const fetchUserDataAndCheckProduct = async () => {
      try {
        const response = await fetchUser();
        setUser(response.data);

        const portfolioResponse = await fetchUserPortfolios();
        if (portfolioResponse.data && portfolioResponse.data.wishlists) {
          setPortfolios(portfolioResponse.data.wishlists);

          // Check if the product exists in any portfolio
          const productExists = portfolioResponse.data.wishlists.some(portfolio =>
            portfolio.items.some(item => item.post_id === productId) // Match productId with post_id
          );
          setIsProductInPortfolio(productExists); // Update state
        }
      } catch (err) {
        console.error("Error fetching user or portfolios:", err);
        setError('Failed to load user data.');
      }
    };

    fetchUserDataAndCheckProduct();
  }, [productId]);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetchPostBySlug(slug);
        setProduct(response.data);
        if (response.data.wishlistId) {
          setSelectedPortfolio(response.data.wishlistId);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    getProduct();
  }, [slug]);

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
    const message = `Thank you for visiting the ICA Experience Center. Here's the portfolio of finishes you liked during your visit: ${currentUrl}`; // WhatsApp auto-links URLs

    // Open WhatsApp with the message
    window.open(`https://wa.me/?text=${message}`, "_blank");
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
    // Navigate back to the previous page in the history stack
    navigate(-1);
  };

  const handleViewInARClick = (url) => {
    if (!url) {
      setError('AR URL not available');
      return;
    }
    navigate('/viewinar', { state: { productId, arUrl: url } });
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
        // Note: The `portfolio.items.includes(productId)` check might be problematic
        // if `portfolio.items` contains objects and `productId` is just an ID.
        // You might need to adjust this based on the actual structure of `portfolio.items`.
        // For example, if items are objects like {id: 1, post_id: 123}, you'd check:
        // portfolio.items.some(item => item.post_id === productId)
        if (portfolio.items.some(item => item.post_id === productId)) { // Assuming items have a post_id
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
        p.id === Number(selectedPortfolio) ? { ...p, items: [...p.items, { post_id: Number(productId) }] } : p // Add as an object
      );

      setPortfolios(updatedPortfolios);
      setIsProductInPortfolio(true); // Mark product as in portfolio
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
  console.log("Product object:", product.body);
  return (
    <div className='main_menu_wrapper prdctdetail'>
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

          <div>
            <img
              src={`https://api.ica.amigosserver.com/storage/${product.image}`}
              className="card-img prod-title"
              alt={product.title}
            />
          </div>

          <div>
            <h5 className="black-text product_code">Product Name : <span>{product.title}</span></h5>
            <h5 className="black-text product_code">Product Code : <span style={{ textTransform: 'uppercase' }}>{product.code}</span></h5>
          </div>

          <div className="row mt-4 maincontent">
            <div className="col-12 col-md-12 justify_center">
              <div dangerouslySetInnerHTML={{ __html: product.body }} />
            </div>

            {!isProductInPortfolio && ( // Conditionally render the button
              <div className='portfolio_btn-div button-container pt-3'>
                <h5><span style={{ color: 'rgb(0, 0, 0)' }}><strong style={{ textTransform: 'none' }}>Liked the Finish? Add it to your collection </strong></span></h5>
                <button className="portfolio_btn" onClick={handleSaveToPortfolioClick}>
                  <i className="fa fa-folder-open" style={{ marginRight: '10px' }}></i>Save to Portfolio
                </button>
              </div>
            )}

            {
              (product.ar_url || product.ar_url_2 || product.ar_url_3) && (
                <div className="button-container portfolio_btn-div">
                  <h5>
                    <span style={{ color: 'rgb(0, 0, 0)' }}>
                      <strong>Visualise the Finish on a furniture piece</strong>
                    </span>
                  </h5>

                  {[
                    { url: product.ar_url, label: 'View table in AR' },
                    { url: product.ar_url_2, label: 'View console in AR' },
                    { url: product.ar_url_3, label: 'View wardrobe in AR' }
                  ].map((item, index) => (
                    item.url ? (
                      <button
                        key={index}
                        className="portfolio_btn"
                        onClick={() => handleViewInARClick(item.url)}
                      >
                        <i className="bi bi-phone" style={{ marginRight: '10px' }}></i>
                        {item.label}
                      </button>
                    ) : null
                  ))}
                </div>
              )
            }

            <div className="whatsapp">
              <a href="#" onClick={handleWhatsAppClick}>
                <h5><span style={{ color: 'rgb(0, 0, 0)' }}><strong>Share via WhatsApp </strong></span></h5>
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
    </div >
  );
};

export default ProductDetail;