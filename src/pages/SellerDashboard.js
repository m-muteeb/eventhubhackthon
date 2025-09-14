import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaTicketAlt, FaCalendar, FaHome, FaSignOutAlt, FaShoppingBag, FaDollarSign, FaUsers } from 'react-icons/fa';
import { Empty } from "antd"; 
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 


import { writeBatch  } from "firebase/firestore"; 
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Row,
  Col,
  Typography,
  Layout,
  Modal,
  Grid,
  Table,
  Select,
  DatePicker
} from "antd";
import {
  UploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../scss/_sellerdashboard.scss";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

const SellerDashboard = () => {
  const { currentUser, signOut } = useAuth();
  const [event, setEvent] = useState({
    name: "",
    category: "",
    price: 0,
    date: "",
    location: "",
    description: "",
    image: "",
    capacity: 0
  });
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("addEvent");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchEvents();
      fetchOrders();
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    try {
      const q = query(
        collection(db, "products"),
        where("organizerUid", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    } catch (error) {
      message.error(`Error fetching events: ${error.message}`);
    }
  };

  const handleRemoveAllEvents = async () => {
    try {
      const batch = writeBatch(db);
      events.forEach((event) => {
        const eventRef = doc(db, "products", event.id);
        batch.delete(eventRef);
      });
      await batch.commit();
      message.success("All events deleted successfully!");
      fetchEvents();
    } catch (error) {
      message.error(`Error deleting events: ${error.message}`);
    }
  };

  const downloadEarnings = () => {
    const earningsData = [
      { description: 'Total GST (15%)', amount: (earnings * 0.15).toFixed(2) },
      { description: 'Total Platform Fee (5%)', amount: (earnings * 0.05).toFixed(2) },
      { description: 'Total Deductions', amount: (earnings * 0.10).toFixed(2) },
      { description: 'Net Earnings', amount: (earnings - (earnings * 0.30)).toFixed(2) },
      { description: 'Total Earnings', amount: earnings.toFixed(2) },
    ];

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Earnings Overview", 14, 22);
    doc.autoTable({
      head: [['Description', 'Amount']],
      body: earningsData.map(item => [item.description, `$${item.amount}`]),
      startY: 30,
    });
    doc.save("earnings.pdf");
  };

  const handleRemoveAllOrders = async () => {
    try {
      const batch = writeBatch(db); 
      orders.forEach((order) => {
        const orderRef = doc(db, "orders", order.id);
        batch.delete(orderRef);
      });
      await batch.commit();
      message.success("All orders deleted successfully!");
      fetchOrders();
    } catch (error) {
      message.error(`Error deleting orders: ${error.message}`);
    }
  };

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("organizerUid", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const orderList = await Promise.all(
        querySnapshot.docs.map(async (orderDoc) => {
          const orderData = orderDoc.data();
          return {
            id: orderDoc.id,
            eventName: orderData.eventName || "Unknown",
            eventPrice: parseFloat(orderData.eventPrice) || 0,
            eventImage: orderData.eventImage || "",
            buyerEmail: orderData.buyerEmail || "Unknown",
            status: orderData.status || "Unknown",
            address: orderData.address || "Unknown",
            category: orderData.category || "Unknown",
            review: orderData.review || "Unknown",
            eventDate: orderData.eventDate || "Unknown",
            tickets: orderData.tickets || 1
          };
        })
      );
      setOrders(orderList);
      calculateEarnings(orderList);
    } catch (error) {
      message.error(`Error fetching orders: ${error.message}`);
    }
  };

  const calculateEarnings = (orders) => {
    const totalEarnings = orders.reduce((acc, order) => {
      if (order.status === "Accepted") {
        const priceAfterFees = order.eventPrice * (1 - 0.20);
        return acc + priceAfterFees;
      }
      return acc;
    }, 0);
    setEarnings(totalEarnings);
  };

  const handleAddEvent = async () => {
    setLoading(true);
    try {
      const eventData = {
        name: event.name,
        category: event.category,
        description: event.description,
        price: event.price,
        image: event.image,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        organizerUid: currentUser.uid,
      };

      await addDoc(collection(db, "products"), eventData);
      message.success("Event added successfully!");
      setEvent({ name: "", category: "", price: 0, image: "", date: "", location: "", description: "", capacity: 0 });
      fetchEvents();
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      message.success("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const showDeleteModal = (eventId) => {
    setSelectedEventId(eventId);
  };

  const handleCancelDelete = () => {
    setSelectedEventId(null);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);
  
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        
        if (orderData.status === undefined || orderData.status === "Pending") {
          await updateDoc(orderRef, { status: "Accepted" });
          const priceAfterFees = orderData.eventPrice * (1 - 0.20);
          setEarnings((prevEarnings) => prevEarnings + priceAfterFees);
          message.success("Order accepted successfully!");
          fetchOrders();
        } else {
          message.error("Order has already been processed.");
        }
      } else {
        message.error("Order not found.");
      }
    } catch (error) {
      message.error(`Error accepting order: ${error.message}`);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);
  
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        
        if (orderData.status === undefined || orderData.status === "Pending") {
          await updateDoc(orderRef, { status: "Rejected" });
          message.success("Order rejected successfully!");
          fetchOrders();
        } else {
          message.error("Order has already been processed.");
        }
      } else {
        message.error("Order not found.");
      }
    } catch (error) {
      message.error(`Error rejecting order: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      message.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      message.error(`Error logging out: ${error.message}`);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar expand="lg" style={{ 
        padding: '1rem', 
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
        background: 'linear-gradient(135deg, #000000, #16a34a)',
      }}>
        <Container style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Navbar.Brand href="#home" style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
           
            <span style={{ fontSize: '20px', color: '#ffffff' }}>EventHub</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" style={{ justifyContent: 'center' }}>
            <Nav className="mr-auto" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Nav.Link
                href="#"
                onClick={() => setActiveSection('addEvent')}
                style={{ color: '#ffffff', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <FaHome style={{ marginRight: '8px' }} /> Add Event
              </Nav.Link>
              <Nav.Link
                href="#"
                onClick={() => setActiveSection('manageEvents')}
                style={{ color: '#ffffff', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <FaCalendar style={{ marginRight: '8px' }} /> Manage Events
              </Nav.Link>
              <Nav.Link
                href="#"
                onClick={() => setActiveSection('orders')}
                style={{ color: '#ffffff', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <FaTicketAlt style={{ marginRight: '8px' }} /> Ticket Orders
              </Nav.Link>
              <Nav.Link
                href="#"
                onClick={() => setActiveSection('earnings')}
                style={{ color: '#ffffff', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <FaDollarSign style={{ marginRight: '8px' }} /> Earnings
              </Nav.Link>
            </Nav>
            <div style={{ marginLeft: 'auto' }}>
              <Button
                type="primary"
                onClick={handleLogout}
                style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = '#14532d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#16a34a'; }}
              >
                <FaSignOutAlt /> Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Layout style={{ margin: 0, transition: "margin-left 0.2s", backgroundColor: 'rgba(0, 0, 0, 0)' }}>
        <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
          {activeSection === "addEvent" && (
            <div>
              <Card style={{ maxWidth: 550, margin: 'auto', borderRadius: '8px', border: '1px solid #e6e6e6', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 24, paddingBottom: 16 }}>
                  <Title level={4} style={{ margin: 0, fontSize: '18px', color: '#2c3e50', textAlign: 'center', fontWeight: 500 }}>
                    Add Event
                  </Title>
                </div>

                <Form layout="vertical" onFinish={handleAddEvent} initialValues={event}>
                  <Form.Item label="Event Name" name="name" rules={[{ required: true, message: 'Please enter event name!' }]}>
                    <Input value={event.name} onChange={(e) => setEvent({ ...event, name: e.target.value })} placeholder="Enter event name" />
                  </Form.Item>

                  <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select category!' }]}>
                    <Select value={event.category} onChange={(value) => setEvent({ ...event, category: value })} placeholder="Select category">
                      <Option value="Music">Music</Option>
                      <Option value="Sports">Sports</Option>
                      <Option value="Conference">Conference</Option>
                      <Option value="Workshop">Workshop</Option>
                      <Option value="Festival">Festival</Option>
                      <Option value="Exhibition">Exhibition</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Ticket Price" name="price" rules={[{ required: true, message: 'Please enter ticket price!' }]}>
                    <Input type="number" value={event.price} onChange={(e) => setEvent({ ...event, price: e.target.value })} placeholder="0.00" prefix="$" />
                  </Form.Item>

                  <Form.Item label="Event Date" name="date" rules={[{ required: true, message: 'Please select event date!' }]}>
                    <Input type="date" value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} />
                  </Form.Item>

                  <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please enter location!' }]}>
                    <Input value={event.location} onChange={(e) => setEvent({ ...event, location: e.target.value })} placeholder="Enter event location" />
                  </Form.Item>

                  <Form.Item label="Capacity" name="capacity" rules={[{ required: true, message: 'Please enter capacity!' }]}>
                    <Input type="number" value={event.capacity} onChange={(e) => setEvent({ ...event, capacity: e.target.value })} placeholder="Enter maximum attendees" />
                  </Form.Item>

                  <Form.Item label="Image URL" name="image" rules={[{ required: false, message: 'Please enter image URL!' }]}>
                    <Input value={event.image} onChange={(e) => setEvent({ ...event, image: e.target.value })} placeholder="Enter image URL" />
                  </Form.Item>

                  <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter description!' }]}>
                    <Input.TextArea value={event.description} onChange={(e) => setEvent({ ...event, description: e.target.value })} placeholder="Enter event description" rows={4} />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '40px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}>
                      Add Event
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          )}

          {activeSection === "manageEvents" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <Button type="danger" onClick={handleRemoveAllEvents} style={{ backgroundColor: 'green', borderColor: 'green', padding: '10px 20px', marginTop: '20px', marginBottom: '20px' }}>
                  Remove All Events
                </Button>
              </div>

              {events.length === 0 ? (
                <Empty description="No events to show" />
              ) : (
                <Row gutter={[16, 16]}>
                  {events.map((event) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                      <Card hoverable cover={<img alt={event.name} src={event.image} style={{ height: 150, objectFit: 'cover' }} />} style={{ marginBottom: 16 }}>
                        <Card.Meta title={event.name} description={`Price: $${event.price}`} />
                        {event.date && <p style={{ margin: '4px 0', color: '#666', fontSize: '12px' }}><FaCalendar /> {event.date}</p>}
                        {event.location && <p style={{ margin: '4px 0', color: '#666', fontSize: '12px' }}><FaUsers /> {event.location}</p>}
                        {event.capacity && <p style={{ margin: '4px 0', color: '#666', fontSize: '12px' }}>Capacity: {event.capacity}</p>}
                        
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                          <Button type="danger" onClick={() => showDeleteModal(event.id)} style={{ backgroundColor: 'red', borderColor: 'red', margin: '8px' }}>
                            Delete
                          </Button>
                        </div>

                        <Modal title="Are you sure?" visible={selectedEventId === event.id} onOk={() => handleDeleteEvent(event.id)} onCancel={handleCancelDelete} okText="Delete" cancelText="Cancel">
                          <p>This action cannot be reversed. Are you sure you want to delete this event?</p>
                        </Modal>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <Button type="danger" onClick={handleRemoveAllOrders} style={{ backgroundColor: 'green', borderColor: 'green', padding: '10px 20px', marginTop: '20px', marginBottom: '20px' }}>
                  Remove All Orders
                </Button>
              </div>

              {orders.length === 0 ? (
                <Empty description="No orders to show" />
              ) : (
                <Row gutter={[16, 16]}>
                  {orders.map((order) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
                      <Card hoverable cover={<img alt={order.eventName} src={order.eventImage} style={{ height: 150, objectFit: 'cover' }} />} style={{ marginBottom: 16 }}>
                        <Card.Meta
                          title={`Order ID: ${order.id}`}
                          description={
                            <>
                              <div>Event: {order.eventName}</div>
                              <div>Price: ${order.eventPrice}</div>
                              <div>Buyer: {order.buyerEmail}</div>
                              <div>Status: {order.status}</div>
                              <div>Tickets: {order.tickets}</div>
                              {order.eventDate && <div>Date: {order.eventDate}</div>}
                            </>
                          }
                        />
                        <div style={{ marginTop: 16 }}>
                          <Button type="primary" onClick={() => handleAcceptOrder(order.id)} style={{ marginRight: 8 }}>
                            Accept
                          </Button>
                          <Button type="danger" onClick={() => handleRejectOrder(order.id)}>
                            Reject
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}

          {activeSection === "earnings" && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Card title={<Title level={4} style={{ textAlign: 'center' }}>Earnings Overview</Title>} style={{ width: '100%', maxWidth: 800, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Table 
                  dataSource={[
                    { key: '1', description: 'Total GST (15%)', amount: (earnings * 0.15).toFixed(2), color: '#FF5722' },
                    { key: '2', description: 'Total Platform Fee (5%)', amount: (earnings * 0.05).toFixed(2), color: '#FFC107' },
                    { key: '3', description: 'Total Deductions', amount: (earnings * 0.10).toFixed(2), color: '#2196F3' },
                    { key: '4', description: 'Net Earnings', amount: (earnings - (earnings * 0.30)).toFixed(2), color: '#FF9800' },
                    { key: '5', description: 'Total Earnings', amount: earnings.toFixed(2), color: '#4CAF50' },
                  ]}
                  pagination={false}
                  bordered
                >
                  <Table.Column title="Description" dataIndex="description" key="description" />
                  <Table.Column 
                    title="Amount" 
                    dataIndex="amount" 
                    key="amount" 
                    render={(text, record) => <span style={{ color: record.color }}>${text}</span>}
                  />
                </Table>

                <Button type="primary" onClick={downloadEarnings} style={{ marginTop: '20px', width: '100%' }}>
                  Download Earnings
                </Button>

                <div style={{ marginTop: '20px', textAlign: 'center', padding: '14px', backgroundColor: '#fff', borderTop: '1px solid #ddd' }}>
                  <Text style={{ color: '#FF5722', fontSize: '14px' }}>
                    <InfoCircleOutlined style={{ marginRight: '8px' }} />
                    Notice: Earnings only based on orders accepted by you. <br />
                    Not valid for court.
                  </Text>
                </div>
              </Card>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SellerDashboard;