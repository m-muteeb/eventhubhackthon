
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase/config";
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaCartPlus, FaBox, FaHome, FaSignOutAlt, FaShoppingBag , FaDollarSign , FaAnchor } from 'react-icons/fa';
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
  Upload,
  message,
  Card,
  Row,
  Col,
  Typography,
  Layout,
  Menu,
  Modal,
  Grid,
  Table,
  Column
} from "antd";
import {
  UploadOutlined,
  PrinterOutlined,
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../scss/_sellerdashboard.scss";

const { Title , Text} = Typography;
const { Content, Sider  } = Layout;
const { useBreakpoint } = Grid;

const SellerDashboard = () => {
  const { currentUser, signOut } = useAuth();
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: 0,
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("addProduct");
  const [collapsed, setCollapsed] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    if (currentUser) {
      fetchProducts();
      fetchOrders();
    }
  }, [currentUser]);

  const fetchProducts = async () => {
    try {
      const q = query(
        collection(db, "products"),
        where("sellerUid", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      message.error(`Error fetching products: ${error.message}`);
    }
  };
  const handleRemoveAllProducts = async () => {
    try {
      const batch = writeBatch(db); // Create a new batch
      products.forEach((product) => {
        const productRef = doc(db, "products", product.id);
        batch.delete(productRef);
      });
      await batch.commit();
      message.success("All products deleted successfully!");
      fetchProducts(); // Refresh product list
    } catch (error) {
      message.error(`Error deleting products: ${error.message}`);
    }
  };
  const downloadEarnings = () => {
    const earningsData = [
      { description: 'Total GST (15%)', amount: (earnings * 0.15).toFixed(2) },
      { description: 'Total App Tax (5%)', amount: (earnings * 0.05).toFixed(2) },
      { description: 'Total Deductions', amount: (earnings * 0.10).toFixed(2) },
      { description: 'Net Earnings', amount: (earnings - (earnings * 0.30)).toFixed(2) },
      { description: 'Total Earnings', amount: earnings.toFixed(2) },
    ];
  
    // Create a new jsPDF instance
    const doc = new jsPDF();
  
    // Add a title
    doc.setFontSize(18);
    doc.text("Earnings Overview", 14, 22);
  
    // Add a table
    doc.autoTable({
      head: [['Description', 'Amount']],
      body: earningsData.map(item => [item.description, `$${item.amount}`]),
      startY: 30,
    });
  
    // Save the PDF
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
      fetchOrders(); // Refresh order list
    } catch (error) {
      message.error(`Error deleting orders: ${error.message}`);
    }
  };
  
  const fetchOrders = async () => {
    try {
      // Query orders where sellerUid matches the currentUser.uid
      const q = query(
        collection(db, "orders"),
        where("sellerUid", "==", currentUser.uid)
      );
  
      const querySnapshot = await getDocs(q);
  
      const orderList = await Promise.all(
        querySnapshot.docs.map(async (orderDoc) => {
          const orderData = orderDoc.data();
  
          // Log the fetched order data for debugging
          console.log('Fetched Order Data:', orderData);
  
          if (!orderData) {
            console.error('Invalid order data:', orderData);
            return {
              id: orderDoc.id,
              productName: "Unknown",
              productPrice: 0,
              productImage: "",
              buyerEmail: "Unknown",
              status: "Unknown",
              address: "Unknown",
              category: "Unknown",
            };
          }
  
          // Use default values if fields are not present
          return {
            id: orderDoc.id,
            productName: orderData.productName || "Unknown",
            productPrice: parseFloat(orderData.productPrice) || 0,
            productImage: orderData.productImage || "",
            buyerEmail: orderData.buyerEmail || "Unknown",
            status: orderData.status || "Unknown",
            address: orderData.address || "Unknown",
            category: orderData.category || "Unknown",
          };
        })
      );
  
      // Set the state with the fetched orders
      setOrders(orderList);
      
      // Calculate earnings based on the fetched orders
      calculateEarnings(orderList);
  
    } catch (error) {
      console.error(`Error fetching orders: ${error.message}`);
      message.error(`Error fetching orders: ${error.message}`);
    }
  };
  
  const calculateEarnings = (orders) => {
    const totalEarnings = orders.reduce((acc, order) => {
      if (order.status === "Accepted") {
        const priceAfterFees = order.productPrice * (1 - 0.20); // 20% fees (15% GST + 5% app fee)
        return acc + priceAfterFees;
      }
      return acc;
    }, 0);
  
    setEarnings(totalEarnings);
  };
  
  const handleAddProduct = async () => {
    setLoading(true);
    try {
        let imageURL = "";
        if (product.image) {
            const imageRef = ref(
                storage,
                `products/${Date.now()}_${product.image.name}`
            );
            await uploadBytes(imageRef, product.image);
            imageURL = await getDownloadURL(imageRef);
        }

        const productData = {
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            image: imageURL,
            sellerUid: currentUser.uid,
        };

        // Always add a new product
        await addDoc(collection(db, "products"), productData);
        message.success("Product added successfully!");

        // Clear the product fields after adding
        setProduct({ name: "", category: "", price: 0, image: null });

        // Fetch products to refresh the list
        fetchProducts();
    } catch (error) {
        message.error(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
};





  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      message.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };
  const [selectedProductId, setSelectedProductId] = useState(null);

const showDeleteModal = (productId) => {
  setSelectedProductId(productId);  // Open the modal for the selected product
};

const handleCancelDelete = () => {
  setSelectedProductId(null);  // Close the modal without deleting
};


  const handleAcceptOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);
  
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        
        // Check if the order status is undefined or 'Pending'
        if (orderData.status === undefined || orderData.status === "Pending") {
          await updateDoc(orderRef, { status: "Accepted" });
  
          // Update earnings
          const priceAfterFees = orderData.productPrice * (1 - 0.20); // 20% fees
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
        
        // Check if the order status is 'Pending' or undefined (allow rejection)
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

 

  const handleModalOk = () => {
    handleAddProduct();
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
     
        backgroundSize: "cover",
      }}
    >
    <Navbar expand="lg" style={{ 
  padding: '1rem', 
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
  background: 'linear-gradient(135deg, #000000, #16a34a)', // Black to dark green gradient
}}>
  <Container style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <Navbar.Brand href="#home" style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
      <FaShoppingBag style={{ marginRight: '8px', fontSize: '24px', color: '#ffffff' }} />
      <span style={{ fontSize: '20px', color: '#ffffff' }}>Shop Nest</span>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" style={{ justifyContent: 'center' }}>
      <Nav className="mr-auto" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Nav.Link
          href="#"
          onClick={() => setActiveSection('addProduct')}
          style={{
            color: '#ffffff', // Change text color to white
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#16a34a'; // Change color on hover
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ffffff'; // Reset color
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaHome style={{ marginRight: '8px' }} /> Add Product
        </Nav.Link>
        <Nav.Link
          href="#"
          onClick={() => setActiveSection('manageProducts')}
          style={{
            color: '#ffffff', // Change text color to white
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#16a34a';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ffffff'; // Reset color
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaBox style={{ marginRight: '8px' }} /> Manage Products
        </Nav.Link>
        <Nav.Link
          href="#"
          onClick={() => setActiveSection('orders')}
          style={{
            color: '#ffffff', // Change text color to white
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#16a34a';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ffffff'; // Reset color
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaCartPlus style={{ marginRight: '8px' }} /> Orders
        </Nav.Link>
        <Nav.Link
          href="#"
          onClick={() => setActiveSection('earnings')}
          style={{
            color: '#ffffff', // Change text color to white
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#16a34a';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#ffffff'; // Reset color
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaDollarSign style={{ marginRight: '8px' }} /> Earnings
        </Nav.Link>
      </Nav>
      <div style={{ marginLeft: 'auto' }}>
        <Button
          type="primary"
          onClick={handleLogout}
          style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', transition: 'all 0.3s ease' }} // Match button color with navbar
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.backgroundColor = '#14532d'; // Darker shade on hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#16a34a'; // Reset color
          }}
        >
          <FaSignOutAlt /> Logout
        </Button>
      </div>
    </Navbar.Collapse>
  </Container>
</Navbar>


<Layout
  style={{
    margin: 0,
    transition: "margin-left 0.2s",
    backgroundColor: 'rgba(0, 0, 0, 0)',
    backgroundSize: "cover",
  }}
>
  <Content
    style={{
      margin: "24px 16px",
      padding: 24,
      minHeight: 280,
    }}
  >
    {activeSection === "addProduct" && (
      <div>
        <Card 
          style={{ 
            maxWidth: 550, 
            margin: 'auto',
            borderRadius: '8px',
            border: '1px solid #e6e6e6',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ 
            borderBottom: '1px solid #f0f0f0', 
            marginBottom: 24, 
            paddingBottom: 16,
          }}>
            <Title level={4} style={{ 
              margin: 0, 
              fontSize: '18px',
              color: '#2c3e50',
              textAlign: 'center',
              fontWeight: 500,
            }}>
              Add Product
            </Title>
          </div>

          <Form
            layout="vertical"
            onFinish={handleAddProduct}
            initialValues={product}
            encType="multipart/form-data"
          >
            {/* Product Name */}
            <Form.Item 
              label={
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  fontWeight: 500 
                }}>
                  Product Name
                </span>
              }
              name="name"
            >
              <Input
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="Enter product name"
                style={{ 
                  borderRadius: '6px',
                  height: '36px',
                  fontSize: '14px'
                }}
              />
            </Form.Item>

            {/* Category */}
            <Form.Item 
              label={
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  fontWeight: 500 
                }}>
                  Category
                </span>
              }
              name="category"
            >
              <Input
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                placeholder="Enter category"
                style={{ 
                  borderRadius: '6px',
                  height: '36px',
                  fontSize: '14px'
                }}
              />
            </Form.Item>

            {/* Price */}
            <Form.Item 
              label={
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  fontWeight: 500 
                }}>
                  Price
                </span>
              }
              name="price"
            >
              <Input
                type="number"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                placeholder="0.00"
                prefix="$"
                style={{ 
                  borderRadius: '6px',
                  height: '36px',
                  fontSize: '14px'
                }}
              />
            </Form.Item>

            {/* Product Description */}
            <Form.Item
              label={
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  fontWeight: 500 
                }}>
                  Product Description
                </span>
              }
              name="description"
            >
              <Input.TextArea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                placeholder="Enter product description"
                style={{ 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                rows={4}
              />
            </Form.Item>

            {/* Product Image */}
            <Form.Item 
              label={
                <span style={{ 
                  fontSize: '14px', 
                  color: '#4a5568',
                  fontWeight: 500 
                }}>
                  Product Image
                </span>
              }
              name="image"
            >
              <Upload
                beforeUpload={(file) => {
                  setProduct({ ...product, image: file });
                  return false;
                }}
                maxCount={1}
                listType="picture-card"
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                <div style={{ padding: '4px' }}>
                  <UploadOutlined style={{ 
                    fontSize: '20px', 
                    color: '#16a34a',
                    opacity: 0.8 
                  }} />
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '12px',
                    color: '#666' 
                  }}>
                    Upload
                  </div>
                </div>
              </Upload>
            </Form.Item>

            {/* Submit Button */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: 0.9,
                  transition: 'all 0.3s ease',
                }}
                htmlType="submit"
                loading={loading}
                type="primary"
                className="hover:opacity-100 hover:shadow-md"
              >
                Add Product
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    )}
  

  {activeSection === "manageProducts" && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <Button 
        type="danger" 
        onClick={handleRemoveAllProducts} 
        style={{ 
          backgroundColor: 'green', 
          borderColor: 'green', 
          padding: '10px 20px',  
          marginTop: '20px',      
          marginBottom: '20px',   
        }}
      >
        Remove All Products
      </Button>
    </div>

    {products.length === 0 ? (
      <Empty description="No products to show" />
    ) : (
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={product.name}
                  src={product.image}
                  style={{ height: 150, objectFit: 'cover' }}
                />
              }
              style={{ marginBottom: 16 }}
            >
              <Card.Meta
                title={product.name}
                description={`Price: $${product.price}`}
              />
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <Button
                  type="danger"
                  onClick={() => showDeleteModal(product.id)}
                  style={{ backgroundColor: 'red', borderColor: 'red', margin: '8px' }}
                >
                  Delete
                </Button>
              </div>

              {/* Modal for deletion confirmation */}
              <Modal
                title="Are you sure?"
                visible={selectedProductId === product.id}
                onOk={() => handleDeleteProduct(product.id)}
                onCancel={handleCancelDelete}
                okText="Delete"
                cancelText="Cancel"
              >
                <p>This action cannot be reversed. Are you sure you want to delete this product?</p>
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
  <Button 
    type="danger" 
    onClick={handleRemoveAllOrders} 
    style={{ 
      backgroundColor: 'green', 
      borderColor: 'green', 
      padding: '10px 20px',  
      marginTop: '20px',      
      marginBottom: '20px',   
    }}
  >
    Remove All Orders
  </Button>
</div>

    {orders.length === 0 ? (
      <Empty description="No orders to show" />
    ) : (
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={order.productName}
                  src={order.productImage}
                  style={{ height: 150, objectFit: 'cover' }}
                />
              }
              style={{ marginBottom: 16 }}
            >
              <Card.Meta
                title={`Order ID: ${order.id}`}
                description={
                  <>
                    <div>Product: {order.productName}</div>
                    <div>Price: ${order.productPrice}</div>
                    <div>Buyer: {order.buyerEmail}</div>
                    <div>Status: {order.status}</div>
                  </>
                }
              />
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  onClick={() => handleAcceptOrder(order.id)}
                  style={{ marginRight: 8 }}
                >
                  Accept
                </Button>
                <Button
                  type="danger"
                  onClick={() => handleRejectOrder(order.id)}
                >
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
    <Card
      title={<Title level={4} style={{ textAlign: 'center' }}>Earnings Overview</Title>}
     
      style={{ width: '100%', maxWidth: 800, backgroundColor: '#f5f5f5', borderRadius: '8px' }}
    >
      <Table 
        dataSource={[
          {
            key: '1',
            description: 'Total GST (15%)',
            amount: (earnings * 0.15).toFixed(2),
            color: '#FF5722',
          },
          {
            key: '2',
            description: 'Total App Tax (5%)',
            amount: (earnings * 0.05).toFixed(2),
            color: '#FFC107',
          },
          {
            key: '3',
            description: 'Total Deductions',
            amount: (earnings * 0.10).toFixed(2),
            color: '#2196F3',
          },
          {
            key: '4',
            description: 'Net Earnings',
            amount: (earnings - (earnings * 0.30)).toFixed(2),
            color: '#FF9800',
          },
          {
            key: '5',
            description: 'Total Earnings',
            amount: earnings.toFixed(2),
            color: '#4CAF50',
          },
        ]}
        pagination={false}
        bordered
        rowClassName={(record) => 'earnings-row'}
        style={{ marginTop: '20px' }}
      >
        <Table.Column title="Description" dataIndex="description" key="description" />
        <Table.Column 
          title="Amount" 
          dataIndex="amount" 
          key="amount" 
          render={(text, record) => (
            <span style={{ color: record.color }}>${text}</span>
          )}
        />
      </Table>

      <Button 
        type="primary" 
        onClick={downloadEarnings} 
        style={{ marginTop: '20px', width: '100%' }}
      >
        Download Earnings
      </Button>

      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        padding: '14px', 
        backgroundColor: '#fff', 
        borderTop: '1px solid #ddd' 
      }}>
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
















