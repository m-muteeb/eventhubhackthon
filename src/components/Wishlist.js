import React, { useState } from 'react';
import { Card, Row, Col, Button } from 'antd';
import { FaHeart } from 'react-icons/fa';

const YourComponent = () => {
  const [wishlist, setWishlist] = useState([
    { name: 'Product 1', price: 29.99, image: 'image1.jpg' },
    { name: 'Product 2', price: 49.99, image: 'image2.jpg' },
    // Add more items as needed
  ]);

  const handleRemoveFromWishlist = (index) => {
    const newWishlist = [...wishlist];
    newWishlist.splice(index, 1);
    setWishlist(newWishlist);
  };

  const renderWishlist = () => (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ marginBottom: '20px', color: 'green' }}>Your Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div style={{ marginTop: '50px' }}>
          <FaHeart style={{ fontSize: '50px', color: 'green' }} />
          <p style={{ fontSize: '18px', color: 'green' }}>Your wishlist is empty</p>
        </div>
      ) : (
        <Row gutter={[16, 16]} className="g-4">
          {wishlist.map((item, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                cover={
                  item.image ? (
                    <img
                      alt={item.name}
                      src={item.image}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  ) : null
                }
                actions={[
                  <Button
                    type="danger"
                    onClick={() => handleRemoveFromWishlist(index)}
                    style={{
                      backgroundColor: 'red',
                      borderColor: 'red',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      transition: 'background-color 0.3s, transform 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'darkred';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'red';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    Remove
                  </Button>,
                ]}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  marginBottom: '24px',
                }}
              >
                <Card.Meta title={`Item ${index + 1}: ${item.name}`} description={`Price: $${item.price}`} />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  return (
    <div>
      {/* Render your Wishlist */}
      {renderWishlist()}
    </div>
  );
};

export default YourComponent;
