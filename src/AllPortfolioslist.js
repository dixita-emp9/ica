import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPosts } from './services/apiService'; // Import fetchPosts from your Axios instance file
import './Portfolios.css';

const Allportfolioslist = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch posts data using the fetchPosts function from axios instance
    fetchPosts()
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  const handleBackClick = () => {
    navigate('/portfolios');
  };

  const handleCardClick = (postId) => {
    navigate(`/productdetail/${postId}`);
  };

  const handleSavePdfClick = () => {
    const pdfUrl = '/Product Catalog - Bluish Stone Effect.pdf';
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="main_menu_wrapper container-fluid">
      <div className='d-flex justify-content-between'>
        <div className='backbtn'>
          <button className="pdf_btn" onClick={handleBackClick} style={{ border: 'none' }}>
            Back
          </button>
        </div>
        <div>
          <button className="pdf_btn" onClick={handleSavePdfClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-4h2v-2h-2v2zm0-4h2V7h-2v2zm-4 6h10v-1.5H7V15z" />
            </svg> Save PDF
          </button>
        </div>
      </div>

      <div className="portfoiliolist container mt-4">
        <div className="row">
          {posts.map(post => (
            <div className="col-12 mb-4" key={post.id} onClick={() => handleCardClick(post.id)}>
              <div className="card bg-dark text-white">
                {/* Update the image src with the full URL */}
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

export default Allportfolioslist;
