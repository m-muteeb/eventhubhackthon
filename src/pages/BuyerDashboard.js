import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, Button, Col, Row, Layout, Form, Input, Modal, notification, Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Nav, Container, Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../scss/_buyerdashboard.scss'; 
import { FaCartPlus, FaBox, FaHome, FaSignOutAlt, FaShoppingCart, FaRegListAlt , FaStar , FaTag , FaShoppingBag  } from 'react-icons/fa';



const { Content } = Layout;
const BuyerDashboard = () => {
 
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('allProducts');
  const { currentUser, signOut } = useAuth();
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        const categorySet = new Set(fetchedProducts.map(product => product.category));
        setCategories(Array.from(categorySet));
      } catch (error) {
        notification.error({
          message: 'Error',
          description: `Error fetching products: ${error.message}`,
        });
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart')) || []);
  }, []);

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleOrderModalOpen = (product) => {
    if (!currentUser) {
      notification.error({
        message: 'Error',
        description: 'You must be logged in to place an order.',
      });
      return;
    }
    

    setOrderDetails({
      cartItems: product ? [product] : [...cart],
      total: product ? product.price : cart.reduce((acc, item) => acc + item.price, 0),
      product,
    });
    setIsOrderModalVisible(true);
  };

  const handleOrder = async (values) => {
    if (!currentUser) {
      notification.error({
        message: 'Error',
        description: 'You must be logged in to place an order.',
      });
      return;
    }

    try {
      const batchOrders = orderDetails.cartItems.map(async (item) => {
        if (!item.sellerEmail) {
          item.sellerEmail = '';
        }

        await addDoc(collection(db, 'orders'), {
          ...item,
          buyerId: currentUser.uid,
          buyerEmail: currentUser.email,
          sellerEmail: item.sellerEmail,
          productName: item.name,
          productPrice: item.price,
          productImage: item.image,
          ...values,
          timestamp: new Date(),
        });
      });

      await Promise.all(batchOrders);

      notification.success({
        message: 'Order Placed',
        description: 'Your order has been placed successfully.',
      });

      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      setActiveSection('myOrders');
      fetchOrders();
      setIsOrderModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error placing order: ${error.message}`,
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      setOrders(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error fetching orders: ${error.message}`,
      });
    }
  };

  const handleAddToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    notification.info({
      message: 'Cart Updated',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    notification.info({
      message: 'Item Removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      notification.success({
        message: 'Logged Out',
        description: 'You have been logged out successfully.',
      });
      window.location.href = '/';
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error logging out: ${error.message}`,
      });
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      notification.success({
        message: 'Order Canceled',
        description: 'Your order has been canceled successfully.',
      });
      fetchOrders();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error canceling order: ${error.message}`,
      });
    }
  };
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalVisible(true);
  };

  const renderProductList = () => (
    <>



<Carousel
    style={{
        height: '400px',
        width: '100%',
        marginTop: '100px',
        borderRadius: '16px', // Rounded corners for the carousel
        overflow: 'hidden' // Prevents overflow from rounded corners
    }}
>
    <Carousel.Item>
        <div style={{
            position: 'relative',
            height: '400px',
            overflow: 'hidden',
            width: '100%',
        }}>
            <img
                className="d-block w-100"
                src="https://img.freepik.com/premium-photo/close-up-t-shirts-hangers-apparel-background_51195-3844.jpg?semt=ais_siglip"
                alt="First slide"
                style={{
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '16px', // Rounded corners for the image
                }}
            />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '20px'
            }}>
               
            </div>
            <div className="badge" style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'red',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                animation: 'bounce 1s infinite alternate',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                zIndex: 10
            }}>
                Sale!
            </div>
        </div>
    </Carousel.Item>
    <Carousel.Item>
        <div style={{
            position: 'relative',
            height: '400px',
            overflow: 'hidden',
            width: '100%',
        }}>
            <img
                className="d-block w-100"
                src="https://img.freepik.com/free-photo/empty-modern-room-with-furniture_23-2149178339.jpg?t=st=1730409644~exp=1730413244~hmac=8d2ca16f3e17bd6dc6348eb0460374f266d980d9e7e29ddd26e0444f831f71a3&w=740"
                alt="Second slide"
                style={{
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '16px', // Rounded corners for the image
                }}
            />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
               
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '20px'
            }}>
                <h3 style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    margin: '0',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)', // Enhanced text shadow for elegance
                    lineHeight: '1.5' // Improved line height for readability
                }}>
                  
                </h3>
            </div>
            <div className="badge" style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'orange',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                animation: 'bounce 1s infinite alternate',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                zIndex: 10
            }}>
                Limited Time
            </div>
        </div>
    </Carousel.Item>
    <Carousel.Item>
        <div style={{
            position: 'relative',
            height: '400px',
            overflow: 'hidden',
            width: '100%',
        }}>
            <img
                className="d-block w-100"
                src="https://img.freepik.com/free-photo/yellow-car-gas-station_23-2150697544.jpg?semt=ais_siglip"
                alt="Third slide"
                style={{
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '16px', // Rounded corners for the image
                }}
            />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
               
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '20px'
            }}>
               
            </div>
            <div className="badge" style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: 'blue',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                animation: 'bounce 1s infinite alternate',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                zIndex: 10
            }}>
                New Arrival
            </div>
        </div>
    </Carousel.Item>
</Carousel>



<div style={{
    width: '100%',
    maxWidth: '800px', // Adjust max width as needed
    margin: '20px auto',
    padding: '20px',
    borderRadius: '8px',
   
    display: 'flex',
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Space items out evenly
}}
>
    <Input
        placeholder="Search products"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginRight: '16px', flex: 1 }} // Use flex to take up available space
    />
    <Select
        placeholder="Select category"
        onChange={setSelectedCategory}
        style={{ width: '200px' }} // Fixed width for the category select
    >
        <Select.Option value="">All Categories</Select.Option>
        {categories.map(category => (
            <Select.Option key={category} value={category}>{category}</Select.Option>
        ))}
    </Select>
</div>


      
<Row gutter={[16, 24]}>
  {filteredProducts.map((product, index) => (
    <Col xs={24} sm={12} md={8} lg={8} xl={8} key={product.id}>
      <Card
        hoverable
        onClick={() => handleProductClick(product)}
        cover={product.image ? (
          <div style={{ position: 'relative' }}>
            <img
              alt={product.name}
              src={product.image}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
            {/* Sale Badge */}
            {Math.random() > 0.5 && ( // Randomly display the sale badge on some cards
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(255, 0, 0, 0.8)', // Red background for sale badge
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                {Math.random() < 0.33 ? '25% Off' : Math.random() < 0.5 ? '50% Off' : '75% Off'} {/* Random discount message */}
              </div>
            )}
          </div>
        ) : null}
        actions={[
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              handleAddToCart(product);
            }}
            style={{
              backgroundColor: '#28a745', // Bootstrap success color
              borderColor: '#28a745',
              borderRadius: '4px', // Rounded corners for button
              fontWeight: 'bold'
            }}
          >
            <FaCartPlus /> Cart
          </Button>,
          <Button
            type="default"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              handleOrderModalOpen(product);
            }}
            style={{
              borderRadius: '4px',
              marginLeft: '8px', // Spacing between buttons
              borderColor: '#007bff', // Bootstrap primary color
              color: '#007bff'
            }}
          >
            Order
          </Button>
        ]}
        style={{
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)', // Softer shadow for elegance
          marginBottom: '24px',
          backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', // Alternate card colors for differentiation
          cursor: 'pointer',
          transition: 'transform 0.2s', // Smooth scaling on hover
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'} // Scale effect on hover
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Card.Meta title={product.name} description={`Category: ${product.category}`} />
        <p className="product-price" style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>${product.price}</p>
      </Card>
    </Col>
  ))}
</Row>


      {/* Product Details Modal */}
      <Modal
        title={selectedProduct?.name}
        visible={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        footer={[
          <Button
            key="cart"
            type="primary"
            onClick={() => {
              handleAddToCart(selectedProduct);
              setIsProductModalVisible(false);
            }}
            style={{ backgroundColor: 'green', borderColor: 'green' }}
          >
            Add to Cart
          </Button>,
          <Button
            key="order"
            onClick={() => {
              handleOrderModalOpen(selectedProduct);
              setIsProductModalVisible(false);
            }}
          >
            Order Now
          </Button>
        ]}
        width={800}
      >
        {selectedProduct && (
          <div style={{ padding: '20px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{selectedProduct.name}</h2>
                <p style={{ fontSize: '20px', color: 'green', fontWeight: 'bold', marginBottom: '16px' }}>
                  ${selectedProduct.price}
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Category</h4>
                  <p>{selectedProduct.category}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Description</h4>
                  <p>{selectedProduct.description || 'No description available.'}</p>
                </div>
                {selectedProduct.specifications && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Specifications</h4>
                    <ul>
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <li key={key}>{`${key}: ${value}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );

  const renderCart = () => (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
  <Button
    type="primary"
    style={{
      marginBottom: '16px',
      backgroundColor: 'green',
      borderColor: 'green',
      padding: '10px 20px',
      fontSize: '18px',
      fontWeight: 'bold',
      borderRadius: '8px',
      transition: 'background-color 0.3s, transform 0.3s',
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = 'darkgreen'; // Darker green on hover
      e.target.style.transform = 'scale(1.05)'; // Slightly enlarge
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'green'; // Original color
      e.target.style.transform = 'scale(1)'; // Original size
    }}
    onClick={() => handleOrderModalOpen()}
  >
    Checkout
  </Button>

  {cart.length === 0 ? (
    <div style={{ marginTop: '50px' }}>
      <FaShoppingCart style={{ fontSize: '50px', color: 'green' }} />
      <p style={{ fontSize: '18px', color: 'green' }}>Your cart is empty</p>
    </div>
  ) : (
    <Row gutter={[16, 16]} className="g-4"> {/* Added gutter for spacing */}
      {cart.map((item, index) => (
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
                onClick={() => handleRemoveFromCart(index)}
                style={{
                  backgroundColor: 'red',
                  borderColor: 'red',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  transition: 'background-color 0.3s, transform 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'darkred'; // Darker red on hover
                  e.target.style.transform = 'scale(1.05)'; // Slightly enlarge
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'red'; // Original color
                  e.target.style.transform = 'scale(1)'; // Original size
                }}
              >
                Remove
              </Button>,
            ]}
            style={{
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              marginBottom: '24px', // Maintained margin for spacing
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

  const renderAuthButton = () => {
    if (currentUser) {
      // If the user is logged in, show the logout button
      return (
        <Button
          onClick={handleLogout}
          style={{
            backgroundColor: 'green',
            color: 'white',
            marginRight: '10px',
          }}
        >
          <FaSignOutAlt /> Logout
        </Button>
      );
    } else {
      // If the user is not logged in, show the login button
      return (
        <Button
          onClick={() => (window.location.href = '/login')} // Redirect to login page
          style={{
            backgroundColor: 'green',
            color: 'white',
          }}
        >
          Login
        </Button>
      );
    }
  };

  // Function to render the "Become Seller" button
  const renderBecomeSellerButton = () => {
    return (
      <Button
        onClick={() => (window.location.href = '/register')}
        style={{
          backgroundColor: 'green',
          color: 'white',
        }}
      >
        Become Seller
      </Button>
    );
  };

  const renderOrders = () => (
    <div style={{ textAlign: 'center' }}>
      <h2>My Orders</h2>
      {orders.filter(order => order.buyerId === currentUser?.uid).length === 0 ? (
        <div style={{ marginTop: '50px' }}>
          <FaRegListAlt style={{ fontSize: '50px', color: 'green' }} />
          <p style={{ fontSize: '18px', color: 'green' }}>You have no orders yet</p>
        </div>
      ) : (
        <Row gutter={16}>
          {orders
            .filter(order => order.buyerId === currentUser?.uid)
            .map(order => (
              <Col xs={24} sm={12} lg={8} key={order.id}>
                <Card
                  cover={order.productImage ? (
                    <img
                      alt={order.productName}
                      src={order.productImage}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  ) : null}
                  actions={[
                    <Button type="danger" onClick={() => handleCancelOrder(order.id)} style={{ backgroundColor: 'red', borderColor: 'red' }}>
                      Cancel Order
                    </Button>
                  ]}
                  style={{ padding: '16px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginBottom: '16px' }}
                >
                  <Card.Meta
                    title={`Order ID: ${order.id}`}
                    description={`Product: ${order.productName} | Price: $${order.productPrice}`}
                  />
                </Card>
              </Col>
            ))}
        </Row>
      )}
    </div>
  );

  return (
    <Layout style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <YourNavbar renderAuthButton={renderAuthButton} renderBecomeSellerButton={renderBecomeSellerButton} setActiveSection={setActiveSection} />

      <Layout style={{ flex: 1, width: '100%', maxWidth: '1200px' }}>
        <Content className="p-4">




          {activeSection === 'allProducts' && renderProductList()} {/* Replace with your product list rendering logic */}
          {activeSection === 'cart' && renderCart()} {/* Replace with your cart rendering logic */}
          {activeSection === 'myOrders' && renderOrders()}
        </Content>
      </Layout>

      <Modal
  title="Order Details"
  visible={isOrderModalVisible}
  onCancel={() => setIsOrderModalVisible(false)}
  footer={null}
  centered
  width={600}
  bodyStyle={{
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px', // Round corners
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
  }}
  style={{ borderRadius: '8px' }} // Round corners for the modal
>
  <Form onFinish={handleOrder}>
    <Form.Item
      label="Name"
      name="name"
      rules={[{ required: true, message: 'Please input your name!' }]}
    >
      <Input
        placeholder="Enter your name"
        style={{
          borderRadius: '4px',
          border: '1px solid #ced4da',
          boxShadow: 'none',
        }}
      />
    </Form.Item>
    <Form.Item
      label="Address"
      name="address"
      rules={[{ required: true, message: 'Please input your address!' }]}
    >
      <Input.TextArea
        rows={4}
        placeholder="Enter your address"
        style={{
          borderRadius: '4px',
          border: '1px solid #ced4da',
          boxShadow: 'none',
        }}
      />
    </Form.Item>
    <Form.Item
      label="Payment Method"
      name="paymentMethod"
      rules={[{ required: true, message: 'Please select a payment method!' }]}
    >
      <Select
        placeholder="Select payment method"
        style={{
          borderRadius: '4px',
          border: '1px solid #ced4da',
        }}
      >
        <Select.Option value="creditCard">Credit Card</Select.Option>
        <Select.Option value="debitCard">Debit Card</Select.Option>
        <Select.Option value="paypal">PayPal</Select.Option>
        <Select.Option value="bankTransfer">Bank Transfer</Select.Option>
        <Select.Option value="cashOnDelivery">Cash on Delivery</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        style={{
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          width: '100%',
          borderRadius: '4px',
        }}
      >
        Place Order
      </Button>
    </Form.Item>
  </Form>
  <div
    style={{
      marginTop: '20px',
      borderTop: '1px solid #e5e5e5',
      paddingTop: '10px',
    }}
  >
    <h4 style={{ marginBottom: '10px', color: '#333' }}>Order Summary</h4>
    {orderDetails.cartItems?.map((item, index) => (
      <div
        key={index}
        className="order-item"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          padding: '10px',
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9', // Light background for item
        }}
      >
        <img
          alt={item.name}
          src={item.image}
          className="order-item-image"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
        <div style={{ marginLeft: '10px' }}>
          <p style={{ margin: '0', fontWeight: 'bold' }}>{item.name}</p>
          <p style={{ margin: '0', color: '#555' }}>Price: ${item.price}</p>
        </div>
      </div>
    ))}
   
  </div>
</Modal>

    </Layout>
  );
};


const YourNavbar = ({ renderAuthButton, renderBecomeSellerButton, setActiveSection }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
   <Navbar
  expand="lg"
  style={{
    background: 'linear-gradient(135deg, #000000, #16a34a)', // Black to dark green gradient
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '15px 0',
    boxShadow: scrolled ? '0 2px 15px rgba(0, 0, 0, 0.08)' : 'none'
  }}
>
  <Container style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <Navbar.Brand
      href="#home"
      style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#ffffff', // White color for text
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.3s ease',
        padding: '8px 15px',
        borderRadius: '8px',
        background: 'transparent',
        transform: scrolled ? 'scale(0.95)' : 'scale(1)'
      }}
    >
      <FaShoppingBag
        style={{
          marginRight: '12px',
          fontSize: '28px',
          color: '#16a34a'
        }}
      />
      <span
        style={{
          background: 'linear-gradient(45deg, #16a34a, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Shop Nest
      </span>
    </Navbar.Brand>

    <Navbar.Toggle
      aria-controls="basic-navbar-nav"
      style={{
        border: 'none',
        padding: '10px',
        boxShadow: 'none',
        transition: 'transform 0.3s ease'
      }}
    />

    <Navbar.Collapse id="basic-navbar-nav">
      <Nav
        style={{
          margin: '0 auto',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {[
          { icon: <FaHome />, text: 'All Products', section: 'allProducts' },
          { icon: <FaCartPlus />, text: 'Cart', section: 'cart' },
          { icon: <FaBox />, text: 'My Orders', section: 'myOrders' }
        ].map((item) => (
          <Nav.Link
            key={item.section}
            href="#"
            onClick={() => setActiveSection(item.section)}
            style={{
              color: '#ffffff', // Change link color to white for better contrast
              padding: '8px 16px',
              margin: '0 5px',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: '500',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff'; // Keep text white on hover
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Light white background on hover
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 255, 255, 0.2)'; // Add shadow on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#ffffff'; // Reset to original color
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none'; // Remove shadow
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.3s ease'
            }}>
              {item.icon}
            </span>
            <span>{item.text}</span>
          </Nav.Link>
        ))}
      </Nav>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginLeft: 'auto'
      }}>
        {renderAuthButton()}
        {renderBecomeSellerButton()}
      </div>
    </Navbar.Collapse>
  </Container>
</Navbar>

  );
};

export default BuyerDashboard;