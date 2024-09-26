import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPosts, generatePdf } from './services/apiService';
import './Portfolios.css';

const Portfolioslist = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistItems } = location.state || { wishlistItems: [] };

  // Extract portfolio data from location state
  const { portfolioId } = location.state || {};

  useEffect(() => {
    if (!wishlistItems || wishlistItems.length === 0) {
      setError('Your Portfolio is empty');
      return;
    }

    fetchPosts()
      .then(response => {
        const allPosts = response.data;
        const filteredPosts = allPosts.filter(post => wishlistItems.includes(post.id.toString()));
        setPosts(filteredPosts);
      })
      .catch(error => console.error('Error fetching posts:', error));
  }, [wishlistItems]);

  const handleBackClick = () => {
    navigate('/portfolios');
  };

  const handleCardClick = (postId) => {
    navigate(`/portfolios/${postId}`, { state: { portfolioId, wishlistItems } });
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await generatePdf(wishlistItems); // This makes the API request to download the PDF
      
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `Product_Catalog_${Date.now()}.pdf`; // Unique filename with timestamp
  
        a.href = url;
        a.setAttribute('download', filename); // Set the download attribute with the filename
        document.body.appendChild(a); // Append the anchor to the body
        a.click(); // Trigger the download
        a.remove(); // Remove the anchor after downloading
      } else {
        throw new Error('PDF generation failed. No data returned.');
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError('Failed to download PDF.');
    }
  };
   
  return (
    <div className="main_menu_wrapper container-fluid">
      <div className='d-flex justify-content-between'>
        <div className='backbtn'>
          <button onClick={handleBackClick}>
          <i className="fa fa-arrow-left"></i>
          </button>
        </div>
        <div>
          <button className="pdf_btn" onClick={handleDownloadPDF}>
          <i className="fa fa-download"></i>  Save PDF
          </button>
        </div>
      </div>

      <div className="portfoiliolist container mt-4">
        {error && <div className="alert alert-warning">{error}</div>} {/* Display error message if any */}
        <div className="row">
          {posts.map(post => (
            <div className="col-12 mb-4" key={post.id} onClick={() => handleCardClick(post.id)}>
              <div className="card bg-dark text-white">
                <img 
                  src={`https://api.ica.amigosserver.com/storage/${post.image}`} 
                  className="card-img" 
                  alt={post.title} 
                />
                <div className="card-img-overlay d-flex justify-content-between align-items-center">
                  <h5 className="card-title">{post.title}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolioslist;
