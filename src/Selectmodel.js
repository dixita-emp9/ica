import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Portfolios.css'; // Import custom CSS

const Model = () => {
  const navigate = useNavigate();

  const handlecloseClick = () => {
      navigate('/productdetail');
  };
  
  return (
    <div className="main_menu_wrapper container-fluid">
      <div>
        <h4 className="text-center mb-4 text-dark">PLEASE SELECT A MODEL</h4>
      </div>
      <div className="portfoiliolist container mt-4">
        <div className="row">
          <div className='text-end'>
            <i className="bi bi-x" onClick={handlecloseClick} style={{ fontSize: "2rem", cursor: "pointer" }}></i>
          </div>
          <div className="col-12 mb-4">
            <div className="modelcard text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="15%" fill="#ff242c" viewBox="0 0 448 512"><path d="M248 48l0 208 48 0 0-197.3c23.9 13.8 40 39.7 40 69.3l0 128 48 0 0-128C384 57.3 326.7 0 256 0L192 0C121.3 0 64 57.3 64 128l0 128 48 0 0-128c0-29.6 16.1-55.5 40-69.3L152 256l48 0 0-208 48 0zM48 288c-12.1 0-23.2 6.8-28.6 17.7l-16 32c-5 9.9-4.4 21.7 1.4 31.1S20.9 384 32 384l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96 256 0 0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c11.1 0 21.4-5.7 27.2-15.2s6.4-21.2 1.4-31.1l-16-32C423.2 294.8 412.1 288 400 288L48 288z"/></svg>
              <div className='col-4'>
                <h4 className=" card-title">CHAIR</h4>
              </div>
            </div>
          </div>
          <div className="col-12 mb-4" >
            <div className="modelcard text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="12%" fill="#ff242c" viewBox="0 0 320 512"><path d="M0 32L0 64l320 0 0-32c0-17.7-14.3-32-32-32L32 0C14.3 0 0 14.3 0 32zM24 96L0 96l0 24L0 488c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8 224 0 0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-368 0-24-24 0L24 96zM256 240l0 64c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>
              <div className='col-4'>
                <h4 className="card-title">CABINET</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model;
