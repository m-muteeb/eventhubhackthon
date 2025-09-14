import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, Button, Col, Row, Layout, Form, Input, Modal, notification, Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Nav, Container, Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../scss/_buyerdashboard.scss'; 
import { FaTicketAlt, FaCalendar, FaHome, FaSignOutAlt, FaShoppingCart, FaRegListAlt, FaHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa';


const { Content } = Layout;
const BuyerDashboard = () => {
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('allEvents');
  const { currentUser, signOut } = useAuth();
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedEvents = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);

        const categorySet = new Set(fetchedEvents.map(event => event.category));
        setCategories(Array.from(categorySet));
      } catch (error) {
        notification.error({
          message: 'Error',
          description: `Error fetching events: ${error.message}`,
        });
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart')) || []);
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? event.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, events]);

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  
  const handleOrderModalOpen = (event) => {
    if (!currentUser) {
      notification.error({
        message: 'Error',
        description: 'You must be logged in to purchase tickets.',
      });
      return;
    }
    
    setOrderDetails({
      cartItems: event ? [event] : [...cart],
      total: event ? event.price : cart.reduce((acc, item) => acc + item.price, 0),
      event,
    });
    setIsOrderModalVisible(true);
  };

  const handleOrder = async (values) => {
    if (!currentUser) {
      notification.error({
        message: 'Error',
        description: 'You must be logged in to purchase tickets.',
      });
      return;
    }

    try {
      const batchOrders = orderDetails.cartItems.map(async (item) => {
        if (!item.organizerEmail) {
          item.organizerEmail = '';
        }

        await addDoc(collection(db, 'orders'), {
          ...item,
          buyerId: currentUser.uid,
          buyerEmail: currentUser.email,
          organizerEmail: item.organizerEmail,
          eventName: item.name,
          eventPrice: item.price,
          eventImage: item.image,
          ...values,
          timestamp: new Date(),
        });
      });

      await Promise.all(batchOrders);

      notification.success({
        message: 'Tickets Purchased',
        description: 'Your tickets have been purchased successfully.',
      });

      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      setActiveSection('myOrders');
      fetchOrders();
      setIsOrderModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error purchasing tickets: ${error.message}`,
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

  const handleRate = (rating) => {
    setUserRating(rating);
    setRatings((prevRatings) => {
      const currentRatings = prevRatings[selectedEvent.id] || [];
      return {
        ...prevRatings,
        [selectedEvent.id]: [...currentRatings, rating],
      };
    });
  };
  
  const calculateAverageRating = (eventId) => {
    const eventRatings = ratings[eventId] || [];
    if (eventRatings.length === 0) return 0;
    const sum = eventRatings.reduce((a, b) => a + b, 0);
    return (sum / eventRatings.length).toFixed(1);
  };

  const handleAddToCart = (event) => {
    const updatedCart = [...cart, event];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    notification.info({
      message: 'Cart Updated',
      description: `${event.name} has been added to your Cart.`,
    });
  };

  const handleAddToWish = (event) => {
    const updatedWishlist = [...wishlist, event];
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    notification.info({
      message: 'Wishlist Updated',
      description: `${event.name} has been added to your Wishlist.`,
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

  const handleRemoveFromWish = (index) => {
    const updatedWishlist = wishlist.filter((_, i) => i !== index);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    notification.info({
      message: 'Item Removed',
      description: 'The item has been removed from your Wishlist.',
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
        description: 'Your ticket purchase has been canceled successfully.',
      });
      fetchOrders();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error canceling order: ${error.message}`,
      });
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventModalVisible(true);
  };

  const renderEventList = () => (
    <>
      <Carousel
        style={{
          height: '400px',
          width: '100%',
          marginTop: '100px',
          borderRadius: '16px',
          overflow: 'hidden'
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
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Music Festival"
              style={{
                height: '400px',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />
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
              Sold Out Soon!
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
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Conference"
              style={{
                height: '400px',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />
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
              Limited Seats
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
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Art Exhibition"
              style={{
                height: '400px',
                objectFit: 'cover',
                borderRadius: '16px',
              }}
            />
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
              New Event
            </div>
          </div>
        </Carousel.Item>
      </Carousel>

      <div style={{
        width: '100%',
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Input
          placeholder="Search events"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '16px', flex: 1 }}
        />
        <Select
          placeholder="Select category"
          onChange={setSelectedCategory}
          style={{ width: '200px' }}
        >
          <Select.Option value="">All Categories</Select.Option>
          {categories.map(category => (
            <Select.Option key={category} value={category}>{category}</Select.Option>
          ))}
        </Select>
      </div>

      <Row gutter={[16, 24]}>
        {filteredEvents.map((event, index) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={8} key={event.id}>
            <Card
              hoverable
              onClick={() => handleEventClick(event)}
              cover={event.image ? (
                <div style={{ position: 'relative' }}>
                  <img
                    alt={event.name}
                    src={event.image}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  {Math.random() > 0.5 && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}>
                      {Math.random() < 0.33 ? '25% Off' : Math.random() < 0.5 ? '50% Off' : '75% Off'}
                    </div>
                  )}
                </div>
              ) : null}
              actions={[
                <Button
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(event);
                  }}
                  style={{
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  <FaTicketAlt /> Add to Cart
                </Button>,
                <Button
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWish(event);
                  }}
                  style={{
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  <FaHeart /> Save
                </Button>,
                <Button
                  type="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrderModalOpen(event);
                  }}
                  style={{
                    borderRadius: '4px',
                    marginLeft: '8px',
                    borderColor: '#007bff',
                    color: '#007bff'
                  }}
                >
                  Buy Now
                </Button>
              ]}
              style={{
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                marginBottom: '24px',
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Card.Meta title={event.name} description={`Category: ${event.category}`} />
              <p className="event-price" style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>${event.price}</p>
              {event.date && <p style={{ margin: '4px 0', color: '#666' }}><FaCalendar /> {event.date}</p>}
              {event.location && <p style={{ margin: '4px 0', color: '#666' }}><FaMapMarkerAlt /> {event.location}</p>}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedEvent?.name}
        visible={isEventModalVisible}
        onCancel={() => setIsEventModalVisible(false)}
        footer={[
          <Button
            key="cart"
            type="primary"
            onClick={() => {
              handleAddToCart(selectedEvent);
              setIsEventModalVisible(false);
            }}
            style={{ backgroundColor: 'green', borderColor: 'green' }}
          >
            Add to Cart
          </Button>,
          <Button
            key="order"
            onClick={() => {
              handleOrderModalOpen(selectedEvent);
              setIsEventModalVisible(false);
            }}
          >
            Buy Tickets
          </Button>
        ]}
        width={800}
      >
        {selectedEvent && (
          <div style={{ padding: '20px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{selectedEvent.name}</h2>
                <p style={{ fontSize: '20px', color: 'green', fontWeight: 'bold', marginBottom: '16px' }}>
                  ${selectedEvent.price}
                </p>
                {selectedEvent.date && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Date & Time</h4>
                    <p><FaCalendar /> {selectedEvent.date}</p>
                  </div>
                )}
                {selectedEvent.location && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Location</h4>
                    <p><FaMapMarkerAlt /> {selectedEvent.location}</p>
                  </div>
                )}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Category</h4>
                  <p>{selectedEvent.category}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Description</h4>
                  <p>{selectedEvent.description || 'No description available.'}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Rate this event</h4>
                  <div style={{ display: 'flex', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        onClick={() => handleRate(star)}
                        style={{
                          fontSize: '24px',
                          color: star <= (userRating || 0) ? '#f39c12' : '#ccc',
                          marginRight: '4px'
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ marginTop: '8px' }}>
                    Average Rating: {calculateAverageRating(selectedEvent.id)} ⭐
                  </p>
                </div>
                {selectedEvent.specifications && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Event Details</h4>
                    <ul>
                      {Object.entries(selectedEvent.specifications).map(([key, value]) => (
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
          e.target.style.backgroundColor = 'darkgreen';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'green';
          e.target.style.transform = 'scale(1)';
        }}
        onClick={() => handleOrderModalOpen()}
      >
        Checkout
      </Button>

      {cart.length === 0 ? (
        <div style={{ marginTop: '50px' }}>
          <FaTicketAlt style={{ fontSize: '50px', color: 'green' }} />
          <p style={{ fontSize: '18px', color: 'green' }}>Your Cart is empty</p>
        </div>
      ) : (
        <Row gutter={[16, 16]} className="g-4">
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
                <Card.Meta title={`Ticket ${index + 1}: ${item.name}`} description={`Price: $${item.price}`} />
                {item.date && <p style={{ margin: '4px 0', color: '#666' }}><FaCalendar /> {item.date}</p>}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      {wishlist.length === 0 ? (
        <div style={{ marginTop: '50px' }}>
          <FaHeart style={{ fontSize: '50px', color: 'green' }} />
          <p style={{ fontSize: '18px', color: 'green' }}>Your WishList is empty</p>
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
                    onClick={() => handleRemoveFromWish(index)}
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
                <Card.Meta title={`Event ${index + 1}: ${item.name}`} description={`Price: $${item.price}`} />
                {item.date && <p style={{ margin: '4px 0', color: '#666' }}><FaCalendar /> {item.date}</p>}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderAuthButton = () => {
    if (currentUser) {
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
      return (
        <Button
          onClick={() => (window.location.href = '/login')}
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

  const renderBecomeOrganizerButton = () => {
    return (
      <Button
        onClick={() => (window.location.href = '/register')}
        style={{
          backgroundColor: 'green',
          color: 'white',
        }}
      >
        Become Organizer
      </Button>
    );
  };

  const renderOrders = () => (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>My Tickets</h2>
      {orders.filter(order => order.buyerId === currentUser?.uid).length === 0 ? (
        <div style={{ marginTop: '50px' }}>
          <FaTicketAlt style={{ fontSize: '50px', color: 'green' }} />
          <p style={{ fontSize: '18px', color: 'green' }}>You have no tickets yet</p>
        </div>
      ) : (
        <Row gutter={16}>
          {orders
            .filter(order => order.buyerId === currentUser?.uid)
            .map(order => (
              <Col xs={24} sm={12} lg={8} key={order.id}>
                <Card
                  cover={order.eventImage ? (
                    <img
                      alt={order.eventName}
                      src={order.eventImage}
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
                    title={`Ticket ID: ${order.id}`}
                    description={`Event: ${order.eventName} | Price: $${order.eventPrice}`}
                  />
                  {order.date && <p style={{ margin: '4px 0', color: '#666' }}><FaCalendar /> {order.date}</p>}
                </Card>
              </Col>
            ))}
        </Row>
      )}
    </div>
  );

  return (
    <Layout style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <YourNavbar renderAuthButton={renderAuthButton} renderBecomeOrganizerButton={renderBecomeOrganizerButton} setActiveSection={setActiveSection} />

      <Layout style={{ flex: 1, width: '100%', maxWidth: '1200px' }}>
        <Content className="p-4">
          {activeSection === 'allEvents' && renderEventList()}
          {activeSection === 'cart' && renderCart()}
          {activeSection === 'myOrders' && renderOrders()}
          {activeSection === 'wishlist' && renderWishlist()}
        </Content>
      </Layout>

      <Modal
        title="Ticket Purchase"
        visible={isOrderModalVisible}
        onCancel={() => setIsOrderModalVisible(false)}
        footer={null}
        centered
        width={600}
        bodyStyle={{
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
        style={{ borderRadius: '8px' }}
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
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input
              placeholder="Enter your email"
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
              Purchase Tickets
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
                backgroundColor: '#f9f9f9',
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
                {item.date && <p style={{ margin: '0', color: '#555' }}>Date: {item.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

const YourNavbar = ({ renderAuthButton, renderBecomeOrganizerButton, setActiveSection }) => {
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
        background: 'linear-gradient(135deg, #000000, #16a34a)',
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
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.3s ease',
            padding: '8px 15px',
            borderRadius: '8px',
            background: 'transparent',
            transform: scrolled ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          
          <span
            style={{
              background: 'linear-gradient(45deg, #16a34a, #22c55e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            EventHub
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
              { icon: <FaHome />, text: 'All Events', section: 'allEvents' },
              { icon: <FaTicketAlt />, text: 'Cart', section: 'cart' },
              { icon: <FaHeart />, text: 'WishList', section: 'wishlist' },
              { icon: <FaRegListAlt />, text: 'My Tickets', section: 'myOrders' },
            ].map((item) => (
              <Nav.Link
                key={item.section}
                href="#"
                onClick={() => setActiveSection(item.section)}
                style={{
                  color: '#ffffff',
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
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
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
            {renderBecomeOrganizerButton()}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default BuyerDashboard;