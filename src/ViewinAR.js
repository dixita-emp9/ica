import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPostById } from './services/apiService';

const ViewAr = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId, arUrl: initialArUrl } = location.state || {};

  const [arUrl, setArUrl] = useState(initialArUrl || '');

  useEffect(() => {
    // Fetch product data if arUrl is not available
    if (!arUrl && productId) {
      const fetchProductData = async () => {
        try {
          const response = await fetchPostById(productId);
          if (response && response.data) {
            setArUrl(response.data.ar_url);
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };

      fetchProductData();
    }
  }, [productId, arUrl]);

  const handleBackClick = () => {
    if (productId) {
      navigate(`/portfolios/${productId}`); // Navigate back to ProductDetail with productId
    } else {
      navigate('/portfolios'); // Fallback navigation
    }
  };

  return (
    <div className='main_menu_wrapper'>
      <div className='container'>
        <div className='backbtn'>
          <button onClick={handleBackClick}><i className="fa fa-arrow-left"></i></button>
        </div>
        <div className="iframe-container mt-4">
          {arUrl ? (
            <iframe 
              src={arUrl}
              frameBorder="0"
              scrolling="yes"
              seamless="seamless"
              style={{
                display: 'block',
                width: '100%',
                height: '100vh',
               }}
              allow="camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; microphone;"
            ></iframe>
          ) : (
            <p>Loading AR content...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAr;
