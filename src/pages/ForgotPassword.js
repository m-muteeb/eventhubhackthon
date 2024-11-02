import { sendPasswordResetEmail } from "firebase/auth";

const resetPassword = (email) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("Password reset email sent!");
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error);
    });
};




<Nav className="mr-auto">
<Nav.Link href="#" onClick={() => setActiveSection('addProduct')}>
  <FaHome /> Add Product
</Nav.Link>
<Nav.Link href="#" onClick={() => setActiveSection('manageProducts')}>
  <FaBox /> Manage Products
</Nav.Link>
<Nav.Link href="#" onClick={() => setActiveSection('orders')}>
  <FaCartPlus /> Orders
</Nav.Link>
<Nav.Link href="#" onClick={() => setActiveSection('earnings')}>
  Earnings
</Nav.Link>
</Nav>