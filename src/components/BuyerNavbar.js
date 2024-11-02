import React from 'react';
import { FaShoppingBag } from 'react-icons/fa';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const TopBar = () => {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e5e5',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      marginTop: '50px',
      marginBottom: '50px',
      maxWidth: '1000px', // Adjust max width as needed
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FaShoppingBag style={{ marginRight: '8px', fontSize: '24px' }} />
        <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#000' }}>Shop Nest</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '20px', fontSize: '16px', color: '#000' }}>Contact: (123) 456-7890</span>
        <span style={{ marginRight: '20px', fontSize: '16px', color: '#777' }}>Follow us for updates!</span>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px', color: '#3b5998' }}>
          <FaFacebook size={20} />
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px', color: '#C13584' }}>
          <FaInstagram size={20} />
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px', color: '#0077b5' }}>
          <FaLinkedin size={20} />
        </a>
      </div>
    </div>
  );
};

export default TopBar;
