import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link from react-router-dom
import '../scss/_home.scss'; // Make sure to import the SCSS file for styling
import heroBg from '../assets/green-abstract-geometric-background_23-2148370752.avif';
import whyChooseUsBg from '../assets/green-abstract-geometric-background_23-2148370752.avif';
import logo from '../assets/white logo.png';

function HeroSection() {

  const navigate = useNavigate(); // Hook from React Router

  const handleButtonClick = () => {
    navigate('/register'); // Navigate to the register page
  };
  return (
    <div className="hero-section" style={{ backgroundImage: `url(${heroBg})` }}>
      <img src={logo} className="logo" alt="Shop Nest Logo" />
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
    { title: 'On-time Delivery', description: 'We guarantee timely delivery of all your products.' },
    { title: 'Quality First', description: 'Quality is our priority in all our products and services.' },
    { title: 'Customer Care', description: 'We provide exceptional customer service 24/7.' },
    { title: 'Seller Care', description: 'Support and resources for sellers to thrive.' },
    { title: 'No Spam Products', description: 'We ensure no spam or low-quality products.' },
    { title: 'Easy Returns', description: 'Hassle-free returns for a smooth shopping experience.' }
  ];

  return (
    <div className="our-services">
      <h2>Our Services</h2>
      <div className="services-container row">
        {services.map((service, index) => (
          <div className="service-card col-md-4 col-12" key={index}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyChooseUs() {
  return (
    <div className="why-choose-us" style={{ backgroundImage: `url(${whyChooseUsBg})` }}>
      <h2>Why Choose Us</h2>
      <div className="reasons-container row">
        <div className="reason-card col-md-4 col-12">
          <img
            src="https://img.freepik.com/premium-photo/dynamic-office-scene-logistics-team-strategizing-aidriven-supply-chain-optimization-efficient_980716-568910.jpg?w=740"
            alt="Experienced Team"
            className="reason-image"
          />
          <p>Experienced team with a proven track record</p>
        </div>
        <div className="reason-card col-md-4 col-12">
          <img
            src="https://img.freepik.com/premium-photo/text-customer-focus-notebook-with-pen-magnifying-glass-gray-background_406607-4097.jpg?w=740"
            alt="Customer Focused"
            className="reason-image"
          />
          <p>Customer-focused approach and improve the customer experience</p>
        </div>
        <div className="reason-card col-md-4 col-12">
          <img
            src="https://img.freepik.com/premium-photo/colorful-3d-letters-spelling-best-price-blue-background_639785-103476.jpg?ga=GA1.2.1974615186.1708798045&semt=ais_hybrid"
            alt="Affordable Pricing"
            className="reason-image"
          />
          <p>Affordable pricing with high-quality services</p>
        </div>
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
      <WhyChooseUs />
      <FAQs />
    </div>
  );
}

export default Home;
