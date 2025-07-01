import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchPostById } from './services/apiService';

const ViewAr = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId, arKey = 'ar_url' } = location.state || {};

  const [arUrl, setArUrl] = useState('');

  useEffect(() => {
    if (productId && arKey) {
      const fetchProductData = async () => {
        try {
          const response = await fetchPostById(productId);
          if (response?.data) {
            const urlFromKey = response.data[arKey];
            if (urlFromKey) {
              setArUrl(urlFromKey);
            } else {
              console.warn(`No URL found for key: ${arKey}`);
            }
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };

      fetchProductData();
    }
  }, [productId, arKey]);

  const handleBackClick = () => {
    if (productId) {
      navigate(`/portfolios/${productId}`);
    } else {
      navigate('/portfolios');
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
