import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ViewAr = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = location.state || {}; // Retrieve productId from state

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
          <iframe 
            src="https://mywebar.com/p/Project_0_qbtprz8dtu" 
            width="100%" 
            height="100%" 
            style={{ border: 'none', borderRadius: '20px' }} 
            title="AR Content"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default ViewAr;
