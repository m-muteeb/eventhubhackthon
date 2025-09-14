import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link from react-router-dom
import '../scss/_home.scss'; // Make sure to import the SCSS file for styling
import heroBg from '../assets/green-abstract-geometric-background_23-2148370752.avif';
import whyChooseUsBg from '../assets/green-abstract-geometric-background_23-2148370752.avif';


function HeroSection() {

  const navigate = useNavigate(); // Hook from React Router

  const handleButtonClick = () => {
    navigate('/register'); // Navigate to the register page
  };
  return (
    <div className="hero-section" style={{ backgroundImage: `url(${heroBg})` }}>
     
      <h1>Bring happiness to your life with Shop Nest</h1>
      <p>
        The future of business is yours to shape. Sign up for free and enjoy your online store free.
      </p>
      <div className="email-signup">
        <button className="trial-button" onClick={handleButtonClick}>
          Start Now
        </button>
      </div>
      <div className="email-signup">
        {/* Other elements */}
       
          <p>
            Try Shop Nest free, no credit card required.
          </p>
      
      </div>
    </div>
  );
}

function OurServices() {
  const services = [
    { 
      title: 'Gourmet Dining', 
      description: 'Experience a culinary journey with our gourmet dishes, made from the freshest ingredients.',
      image: 'https://img.freepik.com/free-photo/boiled-chicken-with-asparagus-cauliflower_140725-9321.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip' // Replace with actual image URL
    },
    { 
      title: 'Home Delivery', 
      description: 'Enjoy your favorite meals delivered right to your door, hot and fresh.', 
      image: 'https://img.freepik.com/premium-vector/delivery-man-giving-pizza-order-woman-customer-through-window_209620-312.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip' // Replace with actual image URL
    },
    { 
      title: 'Catering Services', 
      description: 'Let us cater your events with our customizable menus, perfect for any occasion.', 
      image: 'https://img.freepik.com/free-photo/waiter-keeps-salver-with-snacks_8353-9582.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip' // Replace with actual image URL
    },
    { 
      title: 'Outdoor Dining', 
      description: 'Dine al fresco in our beautifully designed outdoor space, perfect for a relaxing meal.', 
      image: 'https://img.freepik.com/premium-photo/hand-with-phone-records-live-music-festival-people-taking-photograph-with-smart-phone-concert_217236-10492.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip' // Replace with actual image URL
    },
    { 
      title: 'Live Music Nights', 
      description: 'Join us for an unforgettable evening with live music, enhancing your dining experience.', 
      image: 'https://img.freepik.com/premium-photo/silhouette-guitarist-stage-fans_367038-94.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip' // Replace with actual image URL
    },
    { 
      title: 'Special Dietary Options', 
      description: 'We cater to all dietary needs with vegan, gluten-free, and allergen-friendly options.', 
      image: 'https://img.freepik.com/free-photo/high-view-gmo-modified-food_23-2148747340.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip' // Replace with actual image URL
    }
  ];

  return (
    <div className="our-services">
      <h2>Our Services</h2>
      <div className="services-container row">
        {services.map((service, index) => (
          <div className="service-card col-md-4 col-12" key={index}>
            <img src={service.image} alt={service.title} className="service-image" />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function FeaturedProducts() {
  const products = [
    { 
      title: 'Gourmet Burger', 
      description: 'Juicy beef burger with fresh toppings.',
      image: 'https://img.freepik.com/free-photo/delicious-meat-burger-wooden-board_140725-950.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip', // Replace with actual image URL
      price: '$12.99'
    },
    { 
      title: 'Pasta Primavera', 
      description: 'A delightful mix of seasonal vegetables and pasta.',
      image: 'https://img.freepik.com/free-photo/penne-pasta-with-tomatos-parmesan-chees-top_140725-10622.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip', // Replace with actual image URL
      price: '$10.99'
    },
    { 
      title: 'Classic Margherita Pizza', 
      description: 'Traditional pizza with fresh basil and mozzarella.',
      image: 'https://img.freepik.com/free-photo/vegetable-based-pizza-with-white-cheese-cherries_114579-1959.jpg?ga=GA1.1.1642102062.1730407199&semt=ais_siglip', // Replace with actual image URL
      price: '$9.99'
    }
  ];

  return (
    <div className="featured-products">
      <h2>Featured Products</h2>
      <div className="products-container row">
        {products.map((product, index) => (
          <div className="product-card col-md-4 col-12" key={index}>
            <img
              src={product.image}
              alt={product.title}
              className="product-image"
            />
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <span className="product-price">{product.price}</span>
          </div>
        ))}
      </div>
      <div className="dashboard-button-container">
        <button className="btn btn-primary" onClick={() => window.location.href = '/buyer-dashboard'}>
          Go to Buyer Dashboard
        </button>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <div className="faq-question">
        <h3>{question}</h3>
        <button className="faq-toggle">{isOpen ? '-' : '+'}</button>
      </div>
      {isOpen && <p className="faq-answer">{answer}</p>}
    </div>
  );
}

function FAQs() {
  return (
    <div className="faqs">
      <h2>FAQs</h2>
      <FAQItem
        question="What is Shop Nest and how does it work?"
        answer="Shop Nest is a complete commerce platform that allows you to start, grow, and manage a business."
      />
      <FAQItem
        question="How much does Shop Nest cost?"
        answer="Shop Nest offers various pricing plans to suit different needs, starting from $0."
      />
      <FAQItem
        question="Can I use my own domain name with Shop Nest?"
        answer="Yes, you can use your own domain name or purchase one through Shop Nest."
      />
      <FAQItem
        question="Do I need to be a designer or developer to use Shop Nest?"
        answer="No, Shop Nest is designed for all skill levels, with intuitive tools and support available."
      />
    </div>
  );
}

function Home() {
  return (
    <div className="home-page">
      <HeroSection />
      <OurServices />
      <FeaturedProducts />
      <FAQs />
    </div>
  );
}

export default Home;
