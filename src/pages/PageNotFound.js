// src/pages/PageNotFound.js
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import '../scss/_pagenotfound.scss';

const PageNotFound = () => {
  return (
    <div className="page-not-found">
      <FaExclamationTriangle className="icon" />
      <h1>404</h1>
      <p>Page Not Found</p>
      <a className='text-center' href='/'>Go to Home</a>
    </div>
   
  );
};

export default PageNotFound;
